currentdir=`pwd`
mkdir -p ${currentdir}/web_model
tensorflowjs_converter \
	--input_format=tf_saved_model \
	--output_node_names='TfPoseEstimator/Openpose/concat_stage7' \
	--saved_model_tags=serve \
	${currentdir}/saved_model \
	${currentdir}/web_model
