"""Original Clock Garden diorama. Blender 5.2, no downloaded assets.
Run: blender -b --factory-startup --python scripts/art/conservatory.py -- OUTPUT_DIR
The output contains editable .blend, day/night PNGs, and camera-projected water anchors.
"""
import bpy
import math
import random
import sys
import os
import json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

random.seed(2407)
out = os.path.abspath(sys.argv[sys.argv.index('--') + 1])
os.makedirs(out, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, rough=.6, metal=0, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    p.inputs['Emission Color'].default_value = (*color, 1)
    p.inputs['Emission Strength'].default_value = emission
    return m

bronze = material('Patinated green bronze', (.075, .22, .18), .32, .65)
brass = material('Warm brass edges', (.44, .27, .09), .3, .75)
stone = material('Blue slate', (.12, .2, .23))
soil = material('Moss earth', (.075, .13, .105))
rim = material('Cut limestone', (.27, .36, .32))
wood = material('Cedar', (.28, .14, .064))
terracotta = material('Glazed pottery', (.37, .17, .10), .32)
water = material('Still jade water', (.026, .16, .17), .19, .55)
leaf_mats = [material('Leaf ' + str(i), col, .4) for i, col in enumerate([
    (.10, .26, .13), (.22, .39, .18), (.045, .18, .12), (.30, .43, .18)])]
petal = material('Ivory blossoms', (.91, .76, .46), .5)
lamp_mat = material('Honey glass', (1, .55, .15), .25, 0, 3)
glass = bpy.data.materials.new('Delicate greenhouse glazing')
glass.use_nodes = True
n = glass.node_tree.nodes
n.clear()
o = n.new('ShaderNodeOutputMaterial')
mix = n.new('ShaderNodeMixShader')
mix.inputs[0].default_value = .12
transparent = n.new('ShaderNodeBsdfTransparent')
g = n.new('ShaderNodeBsdfGlass')
g.inputs['Color'].default_value = (.64, .87, .81, 1)
g.inputs['Roughness'].default_value = .07
g.inputs['IOR'].default_value = 1.15
glass.node_tree.links.new(transparent.outputs[0], mix.inputs[1])
glass.node_tree.links.new(g.outputs[0], mix.inputs[2])
glass.node_tree.links.new(mix.outputs[0], o.inputs[0])

def finish(obj, name, mat):
    obj.name = name
    obj.data.materials.append(mat)
    return obj

def cube(name, loc, size, mat, bevel=.04):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    finish(o, name, mat)
    if bevel:
        mod = o.modifiers.new('Soft crafted edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        o.modifiers.new('Weighted corner normals', 'WEIGHTED_NORMAL')
    return o

def sphere(name, loc, scale, mat, ico=False):
    if ico:
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1, location=loc)
    else:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=1, location=loc)
    o = bpy.context.object
    o.scale = scale
    finish(o, name, mat)
    if not ico:
        for p in o.data.polygons:
            p.use_smooth = True
    return o

def rod(name, a, b, radius, mat):
    a, b = Vector(a), Vector(b)
    d = b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=radius, depth=d.length, location=(a+b)/2)
    o = bpy.context.object
    o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    return finish(o, name, mat)

def polygon(name, verts, mat):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], [list(range(len(verts)))])
    mesh.update()
    o = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(o)
    return finish(o, name, mat)

def ellipse(name, x, y, z, rx, ry, depth, mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=1, depth=depth, location=(x,y,z))
    o = bpy.context.object
    o.scale = (rx,ry,1)
    finish(o,name,mat)
    mod=o.modifiers.new('Rounded rim','BEVEL'); mod.width=.05; mod.segments=3
    o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o

# A tactile planted island, not a flat graphic frame.
ellipse('Basalt plinth',0,0,-.20,4.2,3.45,.55,stone)
ellipse('Living moss surface',0,0,.085,4.12,3.37,.10,soil)
ellipse('Pond coping',-.65,-1.9,.19,1.70,1.05,.18,rim)
ellipse('Pond water',-.65,-1.9,.294,1.55,.9,.035,water)
for i in range(30):
    a=i*math.tau/30
    x,y=4*math.cos(a),3.27*math.sin(a)
    sphere('Weathered edge stone',(x,y,.12),(.20+random.random()*.16,.16,.12),stone,True)

# Greenhouse, front at y=-.55. Fine structural bars keep the planting visible.
cube('Foundation',(0,.85,.27),(3.5,2.95,.25),rim)
for i in range(12):
    cube('Floor board',(-1.54+i*.28,.85,.43),(.26,2.74,.10),wood,.015)
xs=[-1.7,-.85,0,.85,1.7]
ys=[-.6,.3,1.2,2.3]
for x in [-1.7,1.7]:
    for y in ys:
        rod('Wall upright',(x,y,.45),(x,y,2.75),.045,bronze)
    for z in [.56,1.35,2.72]:
        rod('Side rail',(x,-.6,z),(x,2.3,z),.036,bronze)
    for j in range(3):
        polygon('Side glass',[(x,ys[j],.6),(x,ys[j+1],.6),(x,ys[j+1],2.7),(x,ys[j],2.7)],glass)
for y in [-.6,2.3]:
    for x in xs:
        rod('Front mullion',(x,y,.45),(x,y,2.75),.04,bronze)
    for z in [.56,1.35,2.72]:
        rod('Cross rail',(-1.7,y,z),(1.7,y,z),.038,bronze)
    for j in range(4):
        polygon('Front glass',[(xs[j],y,.6),(xs[j+1],y,.6),(xs[j+1],y,2.7),(xs[j],y,2.7)],glass)
    rod('Gable left',(-1.7,y,2.73),(0,y,3.78),.055,bronze)
    rod('Gable right',(0,y,3.78),(1.7,y,2.73),.055,bronze)
    rod('Gable center',(0,y,2.73),(0,y,3.78),.032,bronze)
    polygon('Gable glazing',[(-1.7,y,2.73),(1.7,y,2.73),(0,y,3.78)],glass)
for y in ys:
    rod('Roof rib',(-1.7,y,2.75),(0,y,3.8),.043,bronze)
    rod('Roof rib',(0,y,3.8),(1.7,y,2.75),.043,bronze)
rod('Ridge',(0,-.72,3.81),(0,2.42,3.81),.055,brass)
for side in [-1,1]:
    polygon('Roof glass',[(0,-.6,3.8),(side*1.7,-.6,2.75),(side*1.7,2.3,2.75),(0,2.3,3.8)],glass)
    rod('Roof long seam',(side*.85,-.6,3.275),(side*.85,2.3,3.275),.025,bronze)
# Door handle and front stepping stones.
rod('Door brass handle',(.70,-.66,1.28),(.70,-.66,1.49),.022,brass)
for i in range(4):
    cube('Garden stepping stone',(1.8+i*.26,-.95-i*.47,.21),(.65,.40,.10),rim,.08)

def leaf(start, angle, length, mat):
    x,y,z=start
    # Folded lanceolate leaf with a central vein ridge.
    direction=Vector((math.cos(angle),math.sin(angle),.48))
    cross=Vector((-math.sin(angle),math.cos(angle),0))
    base=Vector(start); mid=base+direction*length*.52; tip=base+direction*length
    verts=[base,mid+cross*length*.22,tip,mid-cross*length*.22,mid+Vector((0,0,.06))]
    mesh=bpy.data.meshes.new('Leaf blade')
    mesh.from_pydata(verts,[],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)])
    mesh.update()
    o=bpy.data.objects.new('Folded botanical leaf',mesh)
    bpy.context.collection.objects.link(o);finish(o,'Folded botanical leaf',mat)

def plant(x,y,z,size,potted=True):
    if potted:
        bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=.15*size,radius2=.23*size,depth=.32*size,location=(x,y,z+.16*size))
        finish(bpy.context.object,'Terracotta planter',terracotta)
        z+=.33*size
        ellipse('Pot earth',x,y,z,.21*size,.21*size,.015,soil)
    rod('Plant stem',(x,y,z),(x,y,z+.62*size),.016*size,leaf_mats[2])
    for i in range(10):
        leaf((x,y,z+(i%4)*.13*size),i*2.4,.45*size,leaf_mats[i%4])

cube('Potting bench',(-1.15,1.1,1.0),(.65,1.9,.12),wood)
for y in [.3,1.85]:
    for x in [-1.4,-.9]: rod('Bench leg',(x,y,.45),(x,y,.95),.04,bronze)
for y in [.4,1.0,1.65]: plant(-1.15,y,1.07,.7)
for x,y,s in [(.8,1.65,1.8),(.95,.4,1),(-.4,1.75,1.1),(.15,.9,.65)]: plant(x,y,.47,s)
for i in range(45):
    a=random.random()*math.tau
    x=math.cos(a)*random.uniform(2.9,3.75)
    y=math.sin(a)*random.uniform(2.6,3.05)
    if y < -1.1 and x > -2.5: continue
    plant(x,y,.16,random.uniform(.35,.85),False)
for x,y in [(-1.65,-1.9),(-1.2,-1.45),(-.1,-1.5)]:
    ellipse('Lily pad',x,y,.329,.21,.18,.018,leaf_mats[1])
    for i in range(6):
        a=i*math.tau/6
        o=sphere('Water lily petal',(x+.08*math.cos(a),y+.08*math.sin(a),.375),(.11,.055,.035),petal)
        o.rotation_euler[2]=a

lights=[]
def point(name,loc,power,color,size):
    data=bpy.data.lights.new(name,'POINT');data.energy=power;data.color=color;data.shadow_soft_size=size
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);obj.location=loc
    return data
for x,y,z in [(0,.7,2.72),(2.55,-.65,.86),(-2.65,-.8,.86)]:
    rod('Lantern stem',(x,y,z-.55),(x,y,z-.05),.025,bronze)
    cube('Lantern foot',(x,y,z-.17),(.28,.28,.05),bronze)
    sphere('Lantern warm globe',(x,y,z),(.095,.095,.16),lamp_mat)
    for dx,dy in [(-.12,-.12),(.12,-.12),(.12,.12),(-.12,.12)]:
        rod('Lantern frame',(x+dx,y+dy,z-.18),(x+dx,y+dy,z+.18),.014,brass)
    cube('Lantern cap',(x,y,z+.2),(.30,.30,.07),bronze)
    lights.append(point('Warm lantern',(x,y,z),35,(1,.58,.25),.18))
rod('Pendant chain',(0,.7,2.94),(0,.7,3.65),.012,brass)

scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=48
scene.cycles.use_denoising=True
scene.cycles.transparent_max_bounces=16
scene.render.resolution_x=1440;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.render.film_transparent=True
scene.world.use_nodes=True
world=scene.world.node_tree.nodes.get('Background')
scene.view_settings.view_transform='AgX'
bpy.ops.object.camera_add(location=(9,-14,10))
cam=bpy.context.object;cam.name='Clock Garden camera'
cam.rotation_euler=(Vector((0,0,1.25))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO';cam.data.ortho_scale=12.5;scene.camera=cam
data=bpy.data.lights.new('Large softbox','AREA');data.shape='DISK';data.size=7
key=bpy.data.objects.new('Large softbox',data);bpy.context.collection.objects.link(key)
key.location=(-3,-4,9);key.rotation_euler=(Vector((0,0,0))-key.location).to_track_quat('-Z','Y').to_euler()
fill=point('Cool rim',(4,4,6),240,(.35,.65,1),3)
# Prefer available compute device; CPU remains a supported deterministic fallback.
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type='OPTIX';prefs.get_devices()
    gpu=[d for d in prefs.devices if d.type=='OPTIX']
    if gpu:
        for d in prefs.devices:d.use=d.type=='OPTIX'
        scene.cycles.device='GPU'
except Exception:
    pass

bpy.context.view_layer.update()
def project(p):
    v=world_to_camera_view(scene,cam,Vector(p))
    return [round(v.x*1440,3),round((1-v.y)*1080,3)]
center=(-.35,-2.15,.325)
anchors={'width':1440,'height':1080,'water':{
    'center':project(center),
    'x':project((center[0]+.5,center[1],center[2])),
    'y':project((center[0],center[1]+.5,center[2]))},
    'fireflies':[project(p) for p in [(-2.7,-.8,.9),(-2.6,.5,1.25),(2.5,.4,1.5),(2.9,-.6,1.2),(-1,-2.5,.7)]]}
with open(os.path.join(out,'anchors.json'),'w') as f:json.dump(anchors,f,indent=2)
for mode in ['day','night']:
    world.inputs['Color'].default_value=(.48,.65,.72,1) if mode=='day' else (.08,.16,.30,1)
    world.inputs['Strength'].default_value=.5 if mode=='day' else .23
    data.energy=1000 if mode=='day' else 500
    data.color=(1,.88,.69) if mode=='day' else (.4,.62,1)
    for light in lights:light.energy=12 if mode=='day' else 60
    scene.render.filepath=os.path.join(out,mode+'.png')
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out,'conservatory.blend'))
    bpy.ops.render.render(write_still=True)
print('CONSERVATORY_COMPLETE',out)
