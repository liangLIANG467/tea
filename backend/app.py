# app.py
import os
import json
import base64
import uuid
import requests
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import numpy as np
from PIL import Image
import tensorflow as tf
import io
import logging
import shutil

# 导入分离的模块
from disease_service import DISEASE_INFO_CN, get_disease_info
from article_service import (
    get_articles_list, get_article_by_id, 
    like_article, get_article_types, ARTICLE_TYPES
)

# 导入地图数据
from map import PROVINCES, TEA_GARDENS

# 导入题目数据
from questions import LIUBAO_TEA_QUESTIONS, get_random_questions, check_answer

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== 配置 ====================
app = Flask(__name__)
CORS(app)

# 文件上传配置
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# 创建上传文件夹
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 设置小程序图片静态文件夹路径
MINIPROGRAM_IMAGES_PATH = r'D:\weixin\zuoye\liubao_tea_ai-master\miniprogram\images'

# Ollama配置
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434')
TEXT_MODEL = os.getenv('TEXT_MODEL', 'deepseek-r1:1.5b')

# TensorFlow模型配置
MODEL_PATH = 'models/tea_disease_model.h5'
IMG_SIZE = (224, 224)

# ==================== 类别映射（保持不变）====================
CLASS_NAMES = [
    'algal leaf', 'Anthracnose', 'bird eye spot', 
    'brown blight', 'gray light', 'healthy', 
    'red leaf spot', 'white spot'
]

CLASS_NAME_TO_CN = {
    'algal leaf': '藻斑病', 'Anthracnose': '炭疽病', 
    'bird eye spot': '鸟眼斑病', 'brown blight': '褐枯病',
    'gray light': '灰霉病', 'healthy': '健康',
    'red leaf spot': '红叶斑病', 'white spot': '白斑病'
}

# ==================== 诊断图片保存配置 ====================
DIAGNOSE_IMAGES_PATH = r'D:\weixin\zuoye\liubao_tea_ai-master\backend\dataset\images'
os.makedirs(DIAGNOSE_IMAGES_PATH, exist_ok=True)

# ==================== 加载TensorFlow模型 ====================
def load_disease_model():
    try:
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH, compile=False)
            model.compile(
                optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            logger.info(f"✅ 模型加载成功: {MODEL_PATH}")
            return model
        else:
            logger.warning(f"⚠️ 模型文件不存在: {MODEL_PATH}")
            return None
    except Exception as e:
        logger.error(f"❌ 模型加载失败: {e}")
        return None

disease_model = load_disease_model()

# ==================== 辅助函数 ====================
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_file):
    try:
        image = Image.open(image_file)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        image = image.resize(IMG_SIZE, Image.LANCZOS)
        image_array = np.array(image, dtype=np.float32) / 255.0
        image_array = np.expand_dims(image_array, axis=0)
        return image_array
    except Exception as e:
        logger.error(f"图片预处理错误: {e}")
        raise

def predict_with_confidence(image_file):
    if disease_model is None:
        return None, None, None, "模型未加载"
    
    try:
        processed_image = preprocess_image(image_file)
        predictions = disease_model.predict(processed_image, verbose=0)
        predictions = predictions[0]
        best_idx = np.argmax(predictions)
        best_confidence = float(predictions[best_idx])
        disease_key = CLASS_NAMES[best_idx]
        disease_name_cn = CLASS_NAME_TO_CN.get(disease_key, disease_key)
        
        top3_idx = np.argsort(predictions)[::-1][:3]
        top3_candidates = []
        for i in range(3):
            candidate_key = CLASS_NAMES[top3_idx[i]]
            candidate_cn = CLASS_NAME_TO_CN.get(candidate_key, candidate_key)
            top3_candidates.append({
                'disease': candidate_cn,
                'confidence': float(predictions[top3_idx[i]])
            })
        
        disease_info = get_disease_info(disease_name_cn)
        
        if best_confidence < 0.6:
            logger.warning(f"低置信度预测: {best_confidence:.4f}, 疾病: {disease_name_cn}")
        
        return disease_name_cn, best_confidence, disease_info, top3_candidates
        
    except Exception as e:
        logger.error(f"预测错误: {e}")
        return None, None, None, str(e)

def call_ollama_chat(message, session_id=None):
    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": TEXT_MODEL,
                "messages": [
                    {"role": "system", "content": "你是一位专业的六堡茶专家，熟悉茶叶种植、病害防治、冲泡技巧等知识。"},
                    {"role": "user", "content": message}
                ],
                "stream": False,
                "options": {"temperature": 0.7, "top_p": 0.9}
            },
            timeout=60
        )
        if response.status_code == 200:
            result = response.json()
            return result.get('message', {}).get('content', '')
        else:
            logger.error(f"Ollama返回错误: {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Ollama调用失败: {e}")
        return None

def get_ai_suggestion(disease_name, confidence, disease_info):
    prompt = f"""
    茶树被诊断为: {disease_name}
    识别置信度: {confidence:.2%}
    典型症状: {disease_info.get('symptoms', '未知')}
    
    请提供详细的防治方案:
    1. 该病害的详细识别特征和危害程度
    2. 具体的化学防治措施（药剂名称、浓度、使用方法）
    3. 农业防治措施和管理建议
    4. 预防措施和日常管理要点
    """
    suggestion = call_ollama_chat(prompt)
    if suggestion:
        return suggestion
    else:
        return f"【防治建议】\n{disease_info.get('treatment', '请咨询专业人士')}\n\n【预防措施】\n{disease_info.get('prevention', '做好日常茶园管理')}"

# ==================== 静态文件服务 ====================
@app.route('/images/<path:filename>')
def serve_image(filename):
    try:
        return send_from_directory(MINIPROGRAM_IMAGES_PATH, filename)
    except Exception as e:
        logger.error(f"图片访问失败: {e}")
        return jsonify({'error': '图片不存在'}), 404

# ==================== 文章API路由（调用article_service） ====================
@app.route('/api/articles', methods=['GET'])
def get_articles():
    type_filter = request.args.get('type', '')
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('pageSize', 10))
    
    articles, total = get_articles_list(type_filter, page, page_size)
    
    for article in articles:
        article['coverImageUrl'] = f"http://localhost:5000{article['coverImage']}"
    
    return jsonify({
        'success': True,
        'data': articles,
        'total': total,
        'page': page,
        'pageSize': page_size,
        'totalPages': (total + page_size - 1) // page_size
    })

@app.route('/api/article/<article_id>', methods=['GET'])
def get_article(article_id):
    article = get_article_by_id(article_id)
    if not article:
        return jsonify({'success': False, 'error': '文章不存在'}), 404
    
    article['coverImageUrl'] = f"http://localhost:5000{article['coverImage']}"
    return jsonify({'success': True, 'data': article})

@app.route('/api/article/<article_id>/like', methods=['POST'])
def like_article_api(article_id):
    article = like_article(article_id)
    if not article:
        return jsonify({'success': False, 'error': '文章不存在'}), 404
    return jsonify({'success': True, 'likeCount': article['likeCount']})

@app.route('/api/article/types', methods=['GET'])
def get_article_types_api():
    return jsonify({'success': True, 'data': get_article_types()})

# ==================== 健康检查 ====================
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': disease_model is not None,
        'model_path': MODEL_PATH,
        'ollama_status': 'checking'
    })

# ==================== 病害识别API ====================
@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    if 'image' not in request.files:
        return jsonify({'error': '没有上传图片'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': '文件名为空'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': f'不支持的文件格式'}), 400
    
    detailed = request.form.get('detailed', 'false').lower() == 'true'
    temp_path = None
    try:
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{uuid.uuid4().hex}_{filename}")
        file.save(temp_path)
        
        with open(temp_path, 'rb') as f:
            disease_name, confidence, disease_info, top3_candidates = predict_with_confidence(f)
        
        if disease_name is None:
            return jsonify({'error': '识别失败'}), 500
        
        is_confident = confidence >= 0.65
        suggestion_text = f"识别为{disease_name}，置信度{confidence:.1%}。"
        suggestion_text += "该结果可信度较高。" if is_confident else "建议重新上传更清晰的照片，或参考其他可能的病害。"
        
        result = {
            'success': True,
            'disease': disease_name,
            'confidence': round(confidence, 4),
            'is_confident': is_confident,
            'suggestion_text': suggestion_text,
            'symptoms': disease_info.get('symptoms', ''),
            'treatment': disease_info.get('treatment', ''),
            'prevention': disease_info.get('prevention', ''),
            'top3_candidates': top3_candidates,
            'model_used': 'tensorflow_mobilenetv2'
        }
        
        if detailed and disease_name != '健康':
            ai_suggestion = get_ai_suggestion(disease_name, confidence, disease_info)
            result['ai_suggestion'] = ai_suggestion
            result['model_used'] = 'tensorflow + deepseek-r1:1.5b'
        
        logger.info(f"诊断完成: {disease_name}, 置信度: {confidence:.4f}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"诊断处理失败: {e}")
        return jsonify({'error': f'处理失败: {str(e)}'}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

# ==================== AI对话API ====================
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': '缺少消息内容'}), 400
    
    message = data['message']
    session_id = data.get('session_id')
    reply = call_ollama_chat(message, session_id)
    
    if reply:
        return jsonify({
            'success': True,
            'reply': reply,
            'session_id': session_id or str(uuid.uuid4())
        })
    else:
        return jsonify({
            'success': False,
            'reply': '抱歉，AI服务暂时不可用。请确保Ollama服务已启动，并已下载 deepseek-r1:1.5b 模型。\n\n启动命令:\nollama pull deepseek-r1:1.5b\nollama serve',
            'session_id': session_id or str(uuid.uuid4())
        })

# ==================== 茶园巡检API ====================
@app.route('/api/inspect', methods=['POST'])
def inspect():
    prompt = """请对六堡茶园进行一次详细的虚拟巡检，评估茶园健康状况。请从以下几个方面分析：
    1. 茶园整体外观和生长状态
    2. 可能存在的病虫害风险
    3. 土壤和水分管理建议
    4. 近期需要关注的问题
    """
    suggestion = call_ollama_chat(prompt)
    
    if suggestion:
        return jsonify({
            'success': True,
            'status': 'analyzed',
            'issues': ['请查看详细建议'],
            'suggestion': suggestion,
            'growth_progress': 75,
            'health_score': 85,
            'inspect_time': datetime.now().isoformat()
        })
    else:
        return jsonify({
            'success': True,
            'status': 'healthy',
            'issues': [],
            'suggestion': '茶园整体状态良好，建议继续做好日常管理。重点关注病害监测，保持茶园通风透光。',
            'growth_progress': 75,
            'health_score': 85
        })


# ==================== 模型信息API ====================
@app.route('/api/model_info', methods=['GET'])
def model_info():
    return jsonify({
        'success': True,
        'model_loaded': disease_model is not None,
        'model_path': MODEL_PATH,
        'num_classes': len(CLASS_NAMES),
        'classes': CLASS_NAMES,
        'classes_cn': [CLASS_NAME_TO_CN.get(c, c) for c in CLASS_NAMES],
        'image_size': IMG_SIZE,
        'tensorflow_version': tf.__version__,
        'ollama_model': TEXT_MODEL,
        'confidence_threshold': 0.65
    })

# ==================== 诊断图片管理API ====================
@app.route('/api/diagnose/save', methods=['POST'])
def save_diagnose_record():
    try:
        disease_name = request.form.get('disease', '未知病害')
        confidence = float(request.form.get('confidence', 0))
        
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': '没有上传图片'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'success': False, 'message': '图片文件名为空'}), 400
        
        now = datetime.now()
        timestamp = now.strftime('%Y%m%d_%H%M%S')
        safe_disease_name = disease_name.replace('/', '_').replace('\\', '_').replace(':', '_')
        filename = f"{safe_disease_name}_{timestamp}.jpg"
        
        image_path = os.path.join(DIAGNOSE_IMAGES_PATH, filename)
        image_file.save(image_path)
        
        logger.info(f"图片已保存: {image_path}")
        
        return jsonify({
            'success': True,
            'message': '保存成功',
            'fileName': filename,
            'imageUrl': f"/api/diagnose/image/{filename}"
        })
        
    except Exception as e:
        logger.error(f"保存图片失败: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/diagnose/images/list', methods=['GET'])
def get_diagnose_images_list():
    try:
        if not os.path.exists(DIAGNOSE_IMAGES_PATH):
            return jsonify({'success': True, 'data': [], 'total': 0})
        
        image_files = [f for f in os.listdir(DIAGNOSE_IMAGES_PATH) if f.endswith('.jpg')]
        
        images_data = []
        for filename in image_files:
            name_parts = filename.replace('.jpg', '').split('_')
            disease = name_parts[0] if name_parts else '未知'
            time_part = '_'.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            images_data.append({
                'fileName': filename,
                'disease': disease,
                'imageUrl': f"/api/diagnose/image/{filename}",
                'saveTime': time_part
            })
        
        images_data.sort(key=lambda x: x['saveTime'], reverse=True)
        
        return jsonify({
            'success': True,
            'data': images_data,
            'total': len(images_data)
        })
        
    except Exception as e:
        logger.error(f"获取图片列表失败: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/diagnose/image/<filename>', methods=['GET'])
def get_diagnose_image(filename):
    try:
        return send_from_directory(DIAGNOSE_IMAGES_PATH, filename)
    except Exception as e:
        logger.error(f"获取图片失败: {e}")
        return jsonify({'error': '图片不存在'}), 404

@app.route('/api/diagnose/image/delete/<filename>', methods=['DELETE'])
def delete_diagnose_image(filename):
    try:
        image_path = os.path.join(DIAGNOSE_IMAGES_PATH, filename)
        if os.path.exists(image_path):
            os.remove(image_path)
            logger.info(f"已删除图片: {filename}")
            return jsonify({'success': True, 'message': '删除成功'})
        else:
            return jsonify({'success': False, 'message': '图片不存在'}), 404
    except Exception as e:
        logger.error(f"删除图片失败: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/diagnose/images/delete-all', methods=['DELETE'])
def delete_all_diagnose_images():
    try:
        if os.path.exists(DIAGNOSE_IMAGES_PATH):
            for filename in os.listdir(DIAGNOSE_IMAGES_PATH):
                if filename.endswith('.jpg'):
                    os.remove(os.path.join(DIAGNOSE_IMAGES_PATH, filename))
            logger.info("已删除所有图片")
        return jsonify({'success': True, 'message': '已清空'})
    except Exception as e:
        logger.error(f"清空图片失败: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# ==================== 题目数据API（从questions.py导入） ====================
@app.route('/api/questions/random', methods=['GET'])
def get_random_questions_api():
    """随机获取指定数量的题目"""
    count = int(request.args.get('count', 10))
    questions = get_random_questions(count)
    
    if not questions:
        return jsonify({'success': False, 'message': '暂无题目数据'}), 404
    
    return jsonify({
        'success': True,
        'data': questions,
        'total': len(questions)
    })

@app.route('/api/questions/check', methods=['POST'])
def check_answer_api():
    """检查答案是否正确"""
    data = request.json
    question_id = data.get('questionId')
    user_answer = data.get('answer')
    
    result = check_answer(question_id, user_answer)
    
    if result is None:
        return jsonify({'success': False, 'message': '题目不存在'}), 404
    
    return jsonify({
        'success': True,
        **result
    })

# ==================== 省份和茶园API（从map.py导入） ====================
@app.route('/api/provinces', methods=['GET'])
def get_provinces():
    """获取所有省份列表"""
    return jsonify({
        'success': True,
        'data': PROVINCES
    })

@app.route('/api/gardens/<province_id>', methods=['GET'])
def get_gardens_by_province(province_id):
    """根据省份ID获取茶园列表"""
    province_data = TEA_GARDENS.get(province_id)
    
    if not province_data:
        return jsonify({
            'success': False,
            'message': '省份不存在'
        }), 404
    
    return jsonify({
        'success': True,
        'data': province_data
    })

@app.route('/api/garden/<int:garden_id>', methods=['GET'])
def get_garden_detail(garden_id):
    """获取茶园详情"""
    for province_id, province_data in TEA_GARDENS.items():
        for garden in province_data['gardens']:
            if garden['id'] == garden_id:
                garden['province'] = province_data['province']
                return jsonify({
                    'success': True,
                    'data': garden
                })
    
    return jsonify({
        'success': False,
        'message': '茶园不存在'
    }), 404

# ==================== 启动应用 ====================
if __name__ == '__main__':
    if os.path.exists(MINIPROGRAM_IMAGES_PATH):
        print(f"✅ 图片目录已找到: {MINIPROGRAM_IMAGES_PATH}")
        images = [f for f in os.listdir(MINIPROGRAM_IMAGES_PATH) if f.endswith(('.png', '.jpg', '.jpeg'))]
        print(f"📷 可用图片数量: {len(images)}")
    else:
        print(f"⚠️ 图片目录不存在: {MINIPROGRAM_IMAGES_PATH}")
    
    if os.path.exists(DIAGNOSE_IMAGES_PATH):
        diagnose_images = [f for f in os.listdir(DIAGNOSE_IMAGES_PATH) if f.endswith('.jpg')]
        print(f"📷 诊断图片数量: {len(diagnose_images)}")
    
    print("""
    ╔══════════════════════════════════════════════════════════════════╗
    ║                                                                  ║
    ║     🍵 六堡茶AI助手 v2.0 - 优化版 🍵                            ║
    ║                                                                  ║
    ║     - TensorFlow迁移学习模型 (MobileNetV2)                       ║
    ║     - Ollama AI对话助手 (deepseek-r1:1.5b)                       ║
    ║     - 文章知识库（模块化）                                        ║
    ║     - 病害数据（模块化）                                          ║
    ║     - 地图数据（模块化）                                          ║
    ║     - 题目数据（模块化）                                          ║
    ║     - 统一数据源: images文件夹                                    ║
    ║                                                                  ║
    ║     API地址: http://localhost:5000                               ║
    ║     健康检查: http://localhost:5000/health                       ║
    ║                                                                  ║
    ╚══════════════════════════════════════════════════════════════════╝
    """)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
