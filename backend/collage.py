from dreamdrugs.inception5h import Inception5hModel

import sys

print(sys.argv)

_, ifbname, b, dl, fc, ln, ni, rf, s, ss = sys.argv
ofbname = '_'.join([ifbname, b, dl, fc, ln, ni, rf, s, ss])

b = float(b)
dl = int(dl)
fc = int(fc) if fc is not 'None' else None
ni = int(ni)
rf = float(rf)
s = bool(int(s))
ss = float(ss)

print(fc, ln)

inc = Inception5hModel()

# layers = [op.name for op in inc.graph.get_operations() if op.type=='Conv2D' and 'import/' in op.name]
# feature_nums = [int(inc.graph.get_tensor_by_name(name+':0').get_shape()[-1]) for name in layers]


inc.run(
    '/dreamdrugs/backend/Mirador/{}.jpg'.format(ifbname),
    blend=b,
    depth_level=dl,
    feature_channel=fc,
    layer_name=ln,
    num_iterations=ni,
    rescale_factor=rf,
    squared=s,
    step_size=ss,
    out_path='/uploads/{}.jpg'.format(ofbname)
)
