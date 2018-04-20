export class Human {
	constructor(pairs) {
		const h = this;
		h.pairs = [];
		h.uidx_list = [];
		h.body_parts = {};
		Array.forEach(pairs, function(pair) {
			h.add_pair(pair);
		});
	}

	static get_uidx(part_idx, idx) {
		return part_idx + '-' + idx;
	}

	add_pair(pair) {
		const h = this;
		h.pairs.push(pair);
		const uidx1 = Human.get_uidx(pair.part_idx1, pair.idx1);
		const uidx2 = Human.get_uidx(pair.part_idx2, pair.idx2);
		h.body_parts[pair.part_idx1] = {
			'uidx': uidx1,
			'part_idx': pair.part_idx1,
			'y': pair.coord1[0],
			'x': pair.coord1[1],
			'score': pair.score
		};
		h.body_parts[pair.part_idx2] = {
			'uidx': uidx2,
			'part_idx': pair.part_idx2,
			'y': pair.coord2[0],
			'x': pair.coord2[1],
			'score': pair.score
		};
		h.uidx_list.push(uidx1);
		h.uidx_list.push(uidx2);
	}
	part_count() {
		const h = this;
		return Object.keys(h.body_parts).length;
	}
	get_max_score() {
		const h = this;
		return Math.max.apply(null,
			Object.values(h.body_parts).map(function(body_part) {
				return body_part.score;
			}));
	}
	is_connected(other) {
		const h = this;
		return (h.uidx_list.filter(function(n) {
			return -1 != other.uidx_list.indexOf(n)
		}).length > 0);
	}
	merge(other) {
		const h = this;
		Array.forEach(other.pairs, function(pair) {
			h.add_pair(pair);
		});
	}

	dispose() {}
}
