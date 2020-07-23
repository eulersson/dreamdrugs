from dreamdrugs.inception5h import Inception5hModel

inc = Inception5hModel()


layers = [op.name for op in inc.graph.get_operations() if op.type=='Conv2D' and 'import/' in op.name]
feature_nums = [int(inc.graph.get_tensor_by_name(name+':0').get_shape()[-1]) for name in layers]

for i in reversed(range(len(layers))):
    print(i)
    ln = layers[i]
    ln = ln.replace('import/', '')
    ln = ln.replace('/conv', '')
    for fc in reversed(range(feature_nums[i])):
        print("==============================")
        print("{} {}".format(ln, fc))
        print("==============================")
        inc.run(
            '/dreamdrugs/backend/ovelles.jpg',
            blend=0.2,
            depth_level=5,
            feature_channel=fc,
            layer_name=ln,
            num_iterations=20,
            rescale_factor=0.7,
            squared=True,
            step_size=1.5,
            out_path='/uploads/{}__{}.jpg'.format(ln.replace('/', '.'), fc)
        )
