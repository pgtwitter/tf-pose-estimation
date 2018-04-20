import {
	MobileNetThin
} from './mobilenetthin';
import {
	Human
} from './human';
import {
	Painter
} from './painter';

const imageURL = '/dist/images/p1.jpg';
const modelInfo = {
	MODEL_URL: '/dist/web_model/tensorflowjs_model.pb',
	WEIGHT_MANIFEST_URL: '/dist/web_model/weights_manifest.json',
	INPUT_NODE_NAME: 'TfPoseEstimator/image',
	OUTPUT_NODE_NAME: 'TfPoseEstimator/Openpose/concat_stage7',
	IN_WIDTH: 16 * 27,
	IN_HEIGHT: 16 * 23
}

const input = document.getElementById('i');
const output = document.getElementById('o');
input.onload = async function() {
	const mnt = new MobileNetThin();
	await mnt.load(modelInfo);
	const humans = mnt.inference(input);
	Painter.draw_humans(humans, output, input);
	Painter.paints(document.getElementById('sub'),
		mnt.heatMats, mnt.pafMats, mnt.size, input);
	window.humans = JSON.stringify(humans);
	mnt.dispose();
}
input.src = imageURL;

document.getElementById('d')
	.addEventListener('click', function() {
		var content = window.humans;
		if (!content) return;
		var type = 'application/json';
		var filename = 'humans.json';
		if (content != null && navigator.msSaveBlob)
			return navigator.msSaveBlob(new Blob([content], {
				'type': type,
			}), name);
		var blob = new Blob([content], {
			'type': type
		});
		window.URL = window.URL || window.webkitURL;
		this.setAttribute('href', window.URL.createObjectURL(blob));
		this.setAttribute('download', filename);
	});
