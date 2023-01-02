import os
import base64
import logging as logger
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename


logger.basicConfig(level="DEBUG")
app = Flask(__name__, static_url_path='/media')
# cors = CORS(app)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "mysecret"
app.config["CORS_HEADERS"] = "Content-Type"
db = SQLAlchemy(app)
db.init_app(app)
script_dir = app.root_path
# rel_path = "../images/image1.png"
# abs_file_path = os.path.join(script_dir, rel_path)

# model
class Image(db.Model):
    __tablename__ = 'image'

    id = db.Column(db.Integer, primary_key=True)
    rendered_image = db.Column(db.LargeBinary, nullable=False)
    image_string = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return '{self.id}'

migrate = Migrate(app, db)
db.create_all()


ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg']
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def write_file(img_str, image_id):
    try:
        img_data = base64.b64decode(img_str)
        with open(f"media/images/image_{image_id}.png", "wb") as file:
            file.write(img_data)
            return f"media/images/image_{image_id}.png"
    except Exception as e:
        print("Exception is:",str(e))

import json
# For upload file 
@app.route('/upload_image', methods=['POST'])
@cross_origin()
def upload_file():
    if request.method == 'POST':
        file = json.loads(request.data.decode('utf-8'))['file']

        format, image_string = file.split(';base64,')
        image_string = image_string.encode('utf-8')
        image_string_base64 = base64.b64encode(image_string)
        
        image= Image(rendered_image=image_string_base64, image_string=file)
        db.session.add(image)
        db.session.commit()

        resp = jsonify({'message' : 'Image uploaded successfully'})
        return resp, 200


@app.route('/list_images', methods=['GET']) 
@cross_origin()
def display_image():
    print('**************ketan*********====================******************8')
    output = []
    image = db.session.query(Image).all() 
    for i in image:
        final_image = write_file(i.rendered_image, i.id)
        absolute_url = os.path.join(f'media/images/image_{i.id}.png')
        byte_to_string = (i.rendered_image).decode()
        dict = {"id":i.id,
                "image":absolute_url,
                "image_string":i.image_string
                }
        output.append(dict)

    return jsonify({"output" : output})

@app.route('/analyse_image/<id>', methods=['GET'])
@cross_origin()
def analyse_image(id):
    img = db.session.query(Image).filter(Image.id == id).first()
    final_image = write_file(img.rendered_image, img.id)
    absolute_url = os.path.abspath(f'media/images/image_{img.id}.png')
    resp = jsonify({'id':img.id, 'image' : final_image, 'image_string': img.image_string})
    return resp, 201



if __name__ == "__main__":
    logger.debug("Starting Flask Server")
    app.run(debug=True, host='0.0.0.0', port=5000)