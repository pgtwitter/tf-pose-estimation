import * as tfc from '@tensorflow/tfjs-core';
import {
	loadFrozenModel
} from '@tensorflow/tfjs-converter';
import {
	Estimator
} from './estimator';
import {
	CocoPart
} from './common';

export class MobileNetThin {
	constructor() {}

	async load(modelInfo) {
		const mnt = this;
		mnt.modelInfo = modelInfo;
		mnt.model = await loadFrozenModel(
			mnt.modelInfo.MODEL_URL,
			mnt.modelInfo.WEIGHT_MANIFEST_URL);
	}

	static divide(output) {
		const heatMats = [];
		const pafMats = [];
		const s = output.shape;
		const h = s[1];
		const w = s[2];
		const l = h * w;
		const b = output.buffer();
		const depth = CocoPart.length;
		for (let i = 0; i < depth; i++) {
			const heatMat = new Float32Array(l);
			const pafMatX = new Float32Array(l);
			const pafMatY = new Float32Array(l);
			for (let y = 0; y < h; y++)
				for (let x = 0; x < w; x++) {
					const pos = y * w + x;
					heatMat[pos] = (b.get(0, y, x, i));
					pafMatX[pos] = (b.get(0, y, x, (i * 2) + depth));
					pafMatY[pos] = (b.get(0, y, x, (i * 2) + 1 + depth));
				}
			heatMats.push(heatMat);
			pafMats.push(pafMatX);
			pafMats.push(pafMatY);
		}
		return [heatMats, pafMats];
	}

	inference(input) {
		const mnt = this;
		const pixels = tfc.fromPixels(input);
		const inSize = [mnt.modelInfo.IN_HEIGHT, mnt.modelInfo.IN_WIDTH];
		const fittedPixels = tfc.image.resizeBilinear(pixels, inSize);
		const preprocessedInput = fittedPixels.asType('float32');
		const dict = {};
		dict[mnt.modelInfo.INPUT_NODE_NAME] =
			preprocessedInput.reshape([1, ...preprocessedInput.shape]);;
		const output = mnt.model.execute(dict, mnt.modelInfo.OUTPUT_NODE_NAME);
		const [heatMats, pafMats] = MobileNetThin.divide(output);
		const outSize = [output.shape[1], output.shape[2]];
		this.heatMats = heatMats;
		this.pafMats = pafMats;
		this.size = outSize;
		return Estimator.estimate(heatMats, pafMats, outSize);
	}

	dispose() {
		const mnt = this;
		if (!mnt.model) return;
		mnt.model.dispose();
	}
}
