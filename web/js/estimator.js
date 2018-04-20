import {
	CocoPart,
	CocoColors,
	CocoPairs,
	CocoPairsRender,
	CocoPairsNetwork
} from './common';
import {
	Human
} from './human';
import {
	Painter
} from './painter';

const NMS_Threshold = 0.15;
const Local_PAF_Threshold = 0.2;
const PAF_Count_Threshold = 5;
const Part_Score_Threshold = 4.5

export class Estimator {
	static get_score(x1, y1, x2, y2, pafMatX, pafMatY, w) {
		const num_float = 10.0;
		const num_int = parseInt(num_float);
		const [dx, dy] = [x2 - x1, y2 - y1];
		const normVec = Math.sqrt(dx ** 2 + dy ** 2)
		if (normVec < 1e-4) return [0.0, 0];
		const [vx, vy] = [dx / normVec, dy / normVec];

		const xs = new Float32Array(num_int);
		if (x1 != x2) {
			const delta = (x2 - x1) / num_float;
			for (let i = 0; i < num_int; i++) {
				xs[i] = parseInt(x1 + delta * i + 0.5);
			}
		} else {
			for (let i = 0; i < num_int; i++) {
				xs[i] = parseInt(x1 + 0.5);
			}
		}
		const ys = new Float32Array(num_int);
		if (y1 != y2) {
			const delta = (y2 - y1) / num_float;
			for (let i = 0; i < num_int; i++) {
				ys[i] = parseInt(y1 + delta * i + 0.5);
			}
		} else {
			for (let i = 0; i < num_int; i++) {
				ys[i] = parseInt(y1 + 0.5);
			}
		}

		let score = 0;
		let count = 0;
		for (let i = 0; i < num_int; i++) {
			const x = xs[i];
			const y = ys[i];
			const pos = y * w + x;
			const local_score = pafMatX[pos] * vx + pafMatY[pos] * vy;
			const thidx = (local_score > Local_PAF_Threshold) ? 1 : 0;
			score += (local_score * thidx);
			count += thidx;
		}
		return [score, count];
	}

	static score_pairs(part_idx1, part_idx2, paf_x_idx, paf_y_idx, coords_list, heatMats, pafMats, size) {
		const connection_temp = [];
		const coords1 = coords_list[part_idx1];
		const coords2 = coords_list[part_idx2];
		const heatmap1 = heatMats[part_idx1];
		const heatmap2 = heatMats[part_idx2];
		const pafMatX = pafMats[paf_x_idx];
		const pafMatY = pafMats[paf_y_idx];
		const rescale = [1.0 / size[0], 1.0 / size[1]];
		Array.forEach(coords1, function([y1, x1], idx1) {
			Array.forEach(coords2, function([y2, x2], idx2) {
				const [score, count] = Estimator.get_score(x1, y1, x2, y2, pafMatX, pafMatY, size[1]);
				if (count < PAF_Count_Threshold || score <= 0.0) return;
				connection_temp.push({
					'score': score,
					'part_idx1': part_idx1,
					'part_idx2': part_idx2,
					'idx1': idx1,
					'idx2': idx2,
					'coord1': [y1 * rescale[0], x1 * rescale[1]],
					'coord2': [y2 * rescale[0], x2 * rescale[1]],
					'score1': heatmap1[y1 * size[1] + x1],
					'score2': heatmap2[y2 * size[1] + x2],
				});
			});
		});
		connection_temp.sort(function(a, b) {
			return b.score - a.score;
		});
		const connection = []
		const used_idx1 = [];
		const used_idx2 = [];
		Array.forEach(connection_temp, function(candidate) {
			if (used_idx1.indexOf(candidate.idx1) > -1) return;
			if (used_idx2.indexOf(candidate.idx2) > -1) return;
			connection.push(candidate);
			used_idx1.push(candidate.idx1);
			used_idx2.push(candidate.idx2);
		});
		return connection;
	}

	static _pairs_by_conn_With_coords_list(coords_list, heatMats, pafMats, size) {
		const pairs_by_conn = [];
		for (let i = 0; i < CocoPart.length; i++) {
			const [part_idx1, part_idx2] = CocoPairs[i];
			const [paf_x_idx, paf_y_idx] = CocoPairsNetwork[i];
			const pairs = Estimator.score_pairs(
				part_idx1, part_idx2,
				paf_x_idx, paf_y_idx,
				coords_list, heatMats, pafMats, size);
			Array.prototype.push.apply(pairs_by_conn, pairs);
		}
		return pairs_by_conn;
	}

	static _heatMats_With_coords_list(heatMats, size) {
		const [h, w] = size;
		const coords_list = [];
		const D = 2;
		for (let i = 0; i < CocoPart.length - 1; i++) {
			const coords = [];
			coords_list.push(coords);
			const heatMat = heatMats[i];
			const cutlow = new Float32Array(w * h);
			const filterd = new Float32Array(w * h);
			for (let y = 0; y < h; y++) {
				for (let x = 0; x < w; x++) {
					const pos = y * w + x;
					cutlow[pos] = (heatMat[pos] >= NMS_Threshold) ? heatMat[pos] : 0;
				}
			}
			for (let y = 0; y < h; y++) {
				for (let x = 0; x < w; x++) {
					const pos = y * w + x;
					let maxV = cutlow[pos];
					for (let ly = Math.max(0, y - D); ly < Math.min(h, y + D); ly++) {
						for (let lx = Math.max(0, x - D); lx < Math.min(w, x + D); lx++) {
							const lpos = ly * w + lx;
							maxV = Math.max(maxV, cutlow[lpos]);
						}
					}
					filterd[pos] = maxV;
				}
			}
			for (let y = 0; y < h; y++) {
				for (let x = 0; x < w; x++) {
					const pos = y * w + x;
					if (filterd[pos] == cutlow[pos] && cutlow[pos] >= NMS_Threshold) {
						coords.push([y, x]);
					}
				}
			}
		}
		return coords_list;
	}

	static merge(humans) {
		let tmp = humans;
		while (true) {
			let merge_items = null;
			for (let i = 0; i < tmp.length - 1 && merge_items == null; i++) {
				const k1 = tmp[i];
				for (let j = i + 1; j < tmp.length; j++) {
					const k2 = tmp[j];
					if (k1.is_connected(k2)) {
						merge_items = [k1, k2];
						break;
					}
				}
			}
			if (merge_items != null) {
				merge_items[0].merge(merge_items[1]);
				tmp = tmp.filter(function(human, i) {
					return (human !== merge_items[1]);
				});
			} else
				break;
		}
		return tmp;
	}

	static estimate(heatMats, pafMats, size) {
		const coords_list = Estimator._heatMats_With_coords_list(heatMats, size);
		const pairs_by_conn = Estimator._pairs_by_conn_With_coords_list(coords_list, heatMats, pafMats, size);
		const humans = pairs_by_conn.map(function(pairs) {
			return new Human([pairs]);
		});

		const humans0 = Estimator.merge(humans);

		const humans1 = humans0.filter(function(human) {
			return (human.part_count() >= PAF_Count_Threshold);
		})
		const humans2 = humans1.filter(function(human) {
			return (human.get_max_score() >= Part_Score_Threshold);
		})

		return humans2;
	}
}
