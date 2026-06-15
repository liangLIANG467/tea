# train_model.py
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization, GlobalAveragePooling2D
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, LearningRateScheduler
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.regularizers import l2
from sklearn.utils.class_weight import compute_class_weight
import matplotlib.pyplot as plt

# 配置
IMG_SIZE = (224, 224)
BATCH_SIZE = 32  # 增大batch size提高稳定性
EPOCHS = 120     # 增加训练轮数
NUM_CLASSES = 8

# 类别名称（与文件夹名对应）- 注意：使用空格而不是下划线
CLASS_NAMES = [
    'algal leaf',      # 藻斑病
    'Anthracnose',     # 炭疽病
    'bird eye spot',   # 鸟眼斑病
    'brown blight',    # 褐枯病
    'gray light',      # 灰霉病
    'healthy',         # 健康
    'red leaf spot',   # 红叶斑病
    'white spot'       # 白斑病
]

# 病害中英文映射
DISEASE_NAME_CN = {
    'algal leaf': '藻斑病',
    'Anthracnose': '炭疽病',
    'bird eye spot': '鸟眼斑病',
    'brown blight': '褐枯病',
    'gray light': '灰霉病',
    'healthy': '健康',
    'red leaf spot': '红叶斑病',
    'white spot': '白斑病'
}

def count_samples_per_class(data_dir):
    """统计每个类别的样本数量"""
    class_counts = {}
    for class_name in CLASS_NAMES:
        class_path = os.path.join(data_dir, class_name)
        if os.path.exists(class_path):
            count = len([f for f in os.listdir(class_path) 
                        if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
            class_counts[class_name] = count
        else:
            class_counts[class_name] = 0
    return class_counts

def create_enhanced_data_generators():
    """创建增强的数据生成器 - 更强的数据增强策略"""
    
    # 先检查哪些类别有数据
    class_counts = count_samples_per_class('dataset/train')
    valid_classes = [c for c in CLASS_NAMES if class_counts[c] > 0]
    
    if len(valid_classes) == 0:
        raise ValueError("没有找到任何图片数据！")
    
    print(f"有效类别: {[DISEASE_NAME_CN[c] for c in valid_classes]}")
    
    # 更强的训练数据增强
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=45,           # 增大旋转角度
        width_shift_range=0.3,
        height_shift_range=0.3,
        shear_range=0.3,
        zoom_range=0.4,
        horizontal_flip=True,
        vertical_flip=True,
        brightness_range=[0.6, 1.4],
        channel_shift_range=20,      # 颜色抖动
        fill_mode='reflect',
        validation_split=0.2
    )
    
    # 验证集只做归一化
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )
    
    train_generator = train_datagen.flow_from_directory(
        'dataset/train',
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        classes=valid_classes,
        shuffle=True
    )
    
    validation_generator = val_datagen.flow_from_directory(
        'dataset/train',
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        classes=valid_classes,
        shuffle=False
    )
    
    return train_generator, validation_generator, valid_classes

def create_improved_model(num_classes):
    """改进的模型 - 更大的全连接层"""
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3)
    )
    
    base_model.trainable = False
    
    model = Sequential([
        base_model,
        GlobalAveragePooling2D(),
        Dense(512, activation='relu', kernel_regularizer=l2(0.0005)),  # 增大到512
        BatchNormalization(),
        Dropout(0.5),
        Dense(256, activation='relu', kernel_regularizer=l2(0.0005)),  # 新增一层
        BatchNormalization(),
        Dropout(0.4),
        Dense(128, activation='relu', kernel_regularizer=l2(0.0005)),
        BatchNormalization(),
        Dropout(0.3),
        Dense(num_classes, activation='softmax')
    ])
    
    return model, base_model

def compute_class_weights_balanced(train_generator):
    """使用sklearn计算平衡的类别权重"""
    labels = train_generator.labels
    class_weights = compute_class_weight(
        'balanced',
        classes=np.unique(labels),
        y=labels
    )
    class_weight_dict = dict(enumerate(class_weights))
    # 限制最大权重为3.0，避免过度关注少数类
    class_weight_dict = {k: min(v, 3.0) for k, v in class_weight_dict.items()}
    return class_weight_dict

def scheduler(epoch, lr):
    """学习率调度器 - 余弦退火"""
    if epoch < 30:
        return 0.001
    elif epoch < 60:
        return 0.0005
    elif epoch < 80:
        return 0.0001
    else:
        return 0.00001

def train_model():
    """训练模型 - 优化版"""
    print("=" * 70)
    print("🚀 开始训练茶叶病害识别模型 - 优化版 (目标准确率 >85%)")
    print("=" * 70)
    
    # 统计样本分布
    print("\n📊 样本分布统计:")
    class_counts = count_samples_per_class('dataset/train')
    total_images = 0
    for class_name in CLASS_NAMES:
        cn_name = DISEASE_NAME_CN[class_name]
        count = class_counts[class_name]
        total_images += count
        bar_length = int(count / 5) if count > 0 else 0
        bar = '█' * min(bar_length, 30) if count > 0 else '░'
        print(f"  {cn_name:8} ({class_name:15}): {count:3} 张 {bar}")
    
    # 检查数据
    if total_images == 0:
        print("\n❌ 错误: 未找到任何图片数据！")
        print("   请确保图片放在 dataset/train/类别名/ 目录下")
        return None, None
    
    if len([c for c in CLASS_NAMES if class_counts[c] > 0]) < 2:
        print("\n⚠️ 警告: 只有1个类别有数据，需要至少2个类别才能训练")
        return None, None
    
    print(f"\n📈 总图片数: {total_images}")
    print("🔄 加载数据...")
    train_generator, validation_generator, valid_classes = create_enhanced_data_generators()
    
    num_classes = len(valid_classes)
    print(f"\n📊 实际类别数: {num_classes}")
    print(f"📊 训练样本数: {train_generator.samples}")
    print(f"📊 验证样本数: {validation_generator.samples}")
    
    # 计算类别权重
    class_weights = compute_class_weights_balanced(train_generator)
    print(f"\n⚖️ 类别权重: {class_weights}")
    
    # 创建模型
    print("\n🏗️ 创建改进模型...")
    model, base_model = create_improved_model(num_classes)
    
    # 编译模型 - 使用更高的学习率
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print(model.summary())
    
    # 回调函数
    callbacks = [
        EarlyStopping(
            monitor='val_accuracy',  # 改为监控准确率
            patience=20,
            restore_best_weights=True,
            verbose=1,
            mode='max'
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        ModelCheckpoint(
            'models/tea_disease_model_best.h5',
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        )
    ]
    
    steps_per_epoch = max(1, train_generator.samples // BATCH_SIZE)
    validation_steps = max(1, validation_generator.samples // BATCH_SIZE)
    
    # ==================== 第一阶段：训练顶层 ====================
    print("\n" + "=" * 70)
    print("📚 第一阶段：训练分类层 (40轮)")
    print("=" * 70)
    
    history1 = model.fit(
        train_generator,
        steps_per_epoch=steps_per_epoch,
        epochs=40,
        validation_data=validation_generator,
        validation_steps=validation_steps,
        callbacks=callbacks,
        class_weight=class_weights,
        verbose=1
    )
    
    best_acc1 = max(history1.history['val_accuracy'])
    print(f"\n✅ 第一阶段完成 - 最佳验证准确率: {best_acc1:.4f} ({best_acc1*100:.2f}%)")
    
    # ==================== 第二阶段：微调 ====================
    if num_classes >= 2 and train_generator.samples >= 20:
        print("\n" + "=" * 70)
        print("🔧 第二阶段：微调预训练模型 (60轮)")
        print("=" * 70)
        
        # 解冻部分层
        base_model.trainable = True
        # 冻结前120层（MobileNetV2共154层，解冻最后34层）
        for layer in base_model.layers[:120]:
            layer.trainable = False
        
        # 重新编译，使用更小的学习率
        model.compile(
            optimizer=Adam(learning_rate=1e-5),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # 更新回调，使用更严格的条件
        callbacks_phase2 = [
            EarlyStopping(
                monitor='val_accuracy',
                patience=15,
                restore_best_weights=True,
                verbose=1,
                mode='max'
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=4,
                min_lr=1e-8,
                verbose=1
            ),
            ModelCheckpoint(
                'models/tea_disease_model_best_phase2.h5',
                monitor='val_accuracy',
                save_best_only=True,
                mode='max',
                verbose=1
            )
        ]
        
        history2 = model.fit(
            train_generator,
            steps_per_epoch=steps_per_epoch,
            epochs=60,
            validation_data=validation_generator,
            validation_steps=validation_steps,
            callbacks=callbacks_phase2,
            class_weight=class_weights,
            verbose=1
        )
        
        best_acc2 = max(history2.history['val_accuracy'])
        print(f"\n✅ 第二阶段完成 - 最佳验证准确率: {best_acc2:.4f} ({best_acc2*100:.2f}%)")
        
        # 合并训练历史
        history = {
            'accuracy': history1.history['accuracy'] + history2.history['accuracy'],
            'val_accuracy': history1.history['val_accuracy'] + history2.history['val_accuracy'],
            'loss': history1.history['loss'] + history2.history['loss'],
            'val_loss': history1.history['val_loss'] + history2.history['val_loss']
        }
    else:
        history = {
            'accuracy': history1.history['accuracy'],
            'val_accuracy': history1.history['val_accuracy'],
            'loss': history1.history['loss'],
            'val_loss': history1.history['val_loss']
        }
    
    # 保存最终模型
    os.makedirs('models', exist_ok=True)
    model.save('models/tea_disease_model.h5')
    print("\n💾 模型已保存: models/tea_disease_model.h5")
    
    # 绘制训练曲线
    plot_training_history(history)
    
    # ==================== 最终评估 ====================
    print("\n" + "=" * 70)
    print("📊 最终评估")
    print("=" * 70)
    
    test_loss, test_acc = model.evaluate(validation_generator, verbose=1)
    print(f"\n🎯 验证准确率: {test_acc:.4f} ({test_acc*100:.2f}%)")
    print(f"📉 验证损失: {test_loss:.4f}")
    
    # 详细分类报告
    print("\n📋 各类别详细评估:")
    from sklearn.metrics import classification_report
    
    # 获取所有预测
    y_true = []
    y_pred = []
    all_confidences = []
    
    for i in range(len(validation_generator)):
        x, y = validation_generator[i]
        preds = model.predict(x, verbose=0)
        y_true.extend(np.argmax(y, axis=1))
        y_pred.extend(np.argmax(preds, axis=1))
        all_confidences.extend(np.max(preds, axis=1))
        if i >= len(validation_generator) - 1:
            break
    
    # 获取类别名称（中文）
    target_names = [DISEASE_NAME_CN.get(c, c) for c in valid_classes]
    
    print(classification_report(y_true, y_pred, target_names=target_names, digits=4))
    
    # 输出平均置信度
    avg_confidence = np.mean(all_confidences)
    print(f"\n🎯 平均预测置信度: {avg_confidence:.4f} ({avg_confidence*100:.2f}%)")
    
    # 判断是否达到目标
    if test_acc >= 0.85:
        print("\n🎉 恭喜！模型准确率已达到目标 (>85%)")
    elif test_acc >= 0.80:
        print("\n👍 模型准确率良好 (80-85%)，可进一步优化")
    else:
        print("\n⚠️ 模型准确率偏低，建议：")
        print("   1. 增加更多训练图片")
        print("   2. 检查图片质量（是否清晰、标注正确）")
        print("   3. 确保各类别图片数量平衡")
    
    return model, history

def plot_training_history(history):
    """绘制训练曲线"""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    if 'accuracy' in history:
        axes[0].plot(history['accuracy'], 'b-', label='Train Accuracy', linewidth=2)
        axes[0].plot(history['val_accuracy'], 'r-', label='Validation Accuracy', linewidth=2)
        axes[0].axhline(y=0.85, color='g', linestyle='--', label='Target (85%)')
        axes[0].set_title('Model Accuracy', fontsize=14)
        axes[0].set_xlabel('Epoch', fontsize=12)
        axes[0].set_ylabel('Accuracy', fontsize=12)
        axes[0].legend(loc='lower right')
        axes[0].grid(True, alpha=0.3)
        axes[0].set_ylim([0, 1])
    
    if 'loss' in history:
        axes[1].plot(history['loss'], 'b-', label='Train Loss', linewidth=2)
        axes[1].plot(history['val_loss'], 'r-', label='Validation Loss', linewidth=2)
        axes[1].set_title('Model Loss', fontsize=14)
        axes[1].set_xlabel('Epoch', fontsize=12)
        axes[1].set_ylabel('Loss', fontsize=12)
        axes[1].legend(loc='upper right')
        axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('training_history.png', dpi=150, bbox_inches='tight')
    plt.show()
    print("📊 训练曲线已保存: training_history.png")

if __name__ == "__main__":
    print(f"🔧 TensorFlow版本: {tf.__version__}")
    
    # 设置随机种子
    tf.random.set_seed(42)
    np.random.seed(42)
    
    # 创建模型目录
    os.makedirs('models', exist_ok=True)
    
    # 检查数据集
    if not os.path.exists('dataset/train'):
        print("❌ 错误: 找不到 'dataset/train' 目录")
        print("   请确保目录结构为: dataset/train/类别名/图片文件")
        exit(1)
    
    # 开始训练
    model, history = train_model()
    
    print("\n" + "=" * 70)
    print("🎉 训练完成！")
    print("=" * 70)