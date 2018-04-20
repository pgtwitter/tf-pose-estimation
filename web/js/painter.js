import {
	CocoPart,
	CocoColors,
	CocoPairsRender
} from './common';

export class Painter {
	static draw_humans(humans, outputCanvas, inputImage) {
		const w = parseInt(inputImage.width);
		const h = parseInt(inputImage.height);
		outputCanvas.setAttribute('height', h);
		outputCanvas.setAttribute('width', w);
		const ctx = outputCanvas.getContext('2d');
		ctx.drawImage(inputImage, 0, 0);
		const r = 3;
		const centers = {};
		Array.forEach(humans, function(human) {
			const body_parts_idxs = Object.keys(human.body_parts);
			Array.forEach(CocoPairsRender, function(partname, i) {
				if (body_parts_idxs.indexOf(i + '') == -1) return;
				const body_part = human.body_parts[i];
				const center = [parseInt(body_part.x * w + 0.5), parseInt(body_part.y * h + 0.5)];
				centers[i] = center;
				ctx.fillStyle = 'rgb(' + CocoColors[i].join(',') + ')';
				ctx.arc(center[0], center[1], r, 0, 2 * Math.PI, false);
			});
			const centers_idxs = Object.keys(centers);
			ctx.lineWidth = r;
			Array.forEach(CocoPairsRender, function(pair, pair_order) {
				if (body_parts_idxs.indexOf(pair[0] + '') == -1) return;
				if (body_parts_idxs.indexOf(pair[1] + '') == -1) return;
				if (centers_idxs.indexOf(pair[0] + '') == -1) return;
				if (centers_idxs.indexOf(pair[1] + '') == -1) return;
				ctx.strokeStyle = 'rgb(' + CocoColors[pair_order].join(',') + ')';
				ctx.beginPath();
				ctx.moveTo(centers[pair[0]][0], centers[pair[0]][1]);
				ctx.lineTo(centers[pair[1]][0], centers[pair[1]][1]);
				ctx.stroke();
			});
		});
	}

	static paint(canvas, mat, size, input) {
		const [h, w] = size;
		const max= Math.max.apply(null, mat);
		const min= Math.min.apply(null, mat);
		const scale = (Math.abs(max) > Math.abs(min)) ? max : min;
		canvas.setAttribute('width', w);
		canvas.setAttribute('height', h);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(input, 0, 0, w, h);
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const v = mat[y * w + x];
				if (v > 0) {
					ctx.fillStyle = 'rgba(255, 0, 0, ' + (v / scale) + ')';
				} else {
					ctx.fillStyle = 'rgba(0, 255, 0, ' + (v / scale) + ')';
				}
				ctx.fillRect(x, y, 1, 1);
			}
		}
	}

	static paints(div, heatMats, pafMats, size, input) {
		const table = document.createElement('table');
		div.appendChild(table);
		Array.forEach(CocoPart, function(label, index) {
			const row = document.createElement('tr');
			table.appendChild(row);
			const header = document.createElement('th');
			row.appendChild(header);
			header.textContent = label;
			Array.forEach([heatMats[index], pafMats[index * 2], pafMats[index * 2 + 1]], function(mat) {
				const canvas = document.createElement('canvas');
				row.appendChild(canvas);
				Painter.paint(canvas, mat, size, input);
			});
		});
	}
}
