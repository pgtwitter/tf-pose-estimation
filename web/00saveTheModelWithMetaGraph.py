import tensorflow as tf

graph_path = '../models/graph/mobilenet_thin/graph_opt.pb'
with tf.gfile.GFile(graph_path, 'rb') as f:
    graph_def = tf.GraphDef()
    graph_def.ParseFromString(f.read())

inputName = 'TfPoseEstimator/image:0'
outputName = 'TfPoseEstimator/Openpose/concat_stage7:0'
graph = tf.get_default_graph()
tf.import_graph_def(graph_def, name='TfPoseEstimator')
tensor_image = graph.get_tensor_by_name(inputName)
tensor_output = graph.get_tensor_by_name(outputName)

export_dir = './saved_model'
builder = tf.saved_model.builder.SavedModelBuilder(export_dir)
with tf.Session(graph=graph) as sess:
    builder.add_meta_graph_and_variables(
        sess, [tf.saved_model.tag_constants.SERVING])
    builder.save(as_text=True)
