export const CocoPart = [
	'Nose',
	'Neck',
	'RShoulder',
	'RElbow',
	'RWrist',
	'LShoulder',
	'LElbow',
	'LWrist',
	'RHip',
	'RKnee',
	'RAnkle',
	'LHip',
	'LKnee',
	'LAnkle',
	'REye',
	'LEye',
	'REar',
	'LEar',
	'Background'
];
export const CocoColors = [
	[255, 0, 0],
	[255, 85, 0],
	[255, 170, 0],
	[255, 255, 0],
	[170, 255, 0],
	[85, 255, 0],
	[0, 255, 0],
	[0, 255, 85],
	[0, 255, 170],
	[0, 255, 255],
	[0, 170, 255],
	[0, 85, 255],
	[0, 0, 255],
	[85, 0, 255],
	[170, 0, 255],
	[255, 0, 255],
	[255, 0, 170],
	[255, 0, 85]
];
export const CocoPairs = [
	[1, 2],
	[1, 5],
	[2, 3],
	[3, 4],
	[5, 6],
	[6, 7],
	[1, 8],
	[8, 9],
	[9, 10],
	[1, 11],
	[11, 12],
	[12, 13],
	[1, 0],
	[0, 14],
	[14, 16],
	[0, 15],
	[15, 17],
	[2, 16],
	[5, 17]
];
export const CocoPairsRender = CocoPairs.filter(function(o, i) {
	return (i < CocoPairs.length - 2);
});
export const CocoPairsNetwork = [
	[12, 13],
	[20, 21],
	[14, 15],
	[16, 17],
	[22, 23],
	[24, 25],
	[0, 1],
	[2, 3],
	[4, 5],
	[6, 7],
	[8, 9],
	[10, 11],
	[28, 29],
	[30, 31],
	[34, 35],
	[32, 33],
	[36, 37],
	[18, 19],
	[26, 27]
];
