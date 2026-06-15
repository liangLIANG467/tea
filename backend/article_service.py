# article_service.py
import json
import os
from datetime import datetime

# 文章数据文件路径
ARTICLE_DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'articles.json')

# 确保数据目录存在
os.makedirs(os.path.dirname(ARTICLE_DATA_FILE), exist_ok=True)

# 文章类型列表
ARTICLE_TYPES = ['历史', '工艺', '冲泡', '茶诗', '养生']

# 文章数据
ARTICLES = {
    'a1': {
        'id': 'a1',
        'title': '六堡茶的历史渊源',
        'type': '历史',
        'coverImage': '/miniprogram/images/history.png',
        'content': '六堡茶兴于清朝，嘉庆年间成为名茶，远销南洋，被誉为"可以喝的古董"。六堡茶因原产于广西梧州苍梧县六堡镇而得名，至今已有1500多年历史。在明清时期，六堡茶沿着西江航道运往广州、香港，再转口南洋，成为华人矿工的"保命茶"——因其祛湿解暑的功效，有效缓解了南洋湿热气候带来的身体不适。这条跨越千里的"茶船古道"，见证了六堡茶的辉煌贸易史。如今，六堡茶制作技艺已被列入国家级非物质文化遗产名录，其陈化过程中的"窖藏"工艺更是独树一帜，老茶的"槟榔香"令无数茶人痴迷。',
        'viewCount': 1250,
        'likeCount': 89,
        'createTime': '2024-01-15'
    },
    'a2': {
        'id': 'a2',
        'title': '传统工艺·罨堆发酵',
        'type': '工艺',
        'coverImage': '/miniprogram/images/craft.png',
        'content': '六堡茶核心工艺包含杀青、揉捻、渥堆、陈化，独特的罨堆工艺造就其红浓陈醇的品质特征。罨堆是六堡茶制作中的关键环节，通过控制温度和湿度促进茶叶发酵，这一过程需要经验丰富的制茶师傅精准把握"火候"。与普洱茶不同，六堡茶的渥堆过程更为细腻，有时会采用"双蒸双压"的传统手法，使茶叶在湿热作用下缓慢转化。经过罨堆的六堡茶，汤色逐渐变为深红明亮，滋味变得醇厚顺滑，青涩之气褪去，取而代之的是独特的陈香。',
        'viewCount': 890,
        'likeCount': 67,
        'createTime': '2024-01-20'
    },
    'a3': {
        'id': 'a3',
        'title': '六堡茶冲泡技巧',
        'type': '冲泡',
        'coverImage': '/miniprogram/images/brew.png',
        'content': '建议使用紫砂壶或盖碗，沸水润茶，闷泡片刻出汤，第一泡约10秒，后续每泡增加5秒。六堡茶耐泡，可冲泡10次以上。陈年六堡茶可用煮饮法，风味更佳。具体冲泡步骤：第一步，温杯洁具，用沸水将茶具烫洗一遍，提高器皿温度；第二步，投茶，投茶量约为容器的1/3至1/2，约8-10克；第三步，润茶，用100℃沸水高冲，激发茶香，润茶1-2遍；第四步，冲泡，前3泡即入即出或稍闷5-10秒，之后每泡延长5-10秒；第五步，品饮，小口慢饮，感受茶汤的醇厚回甘。',
        'viewCount': 2100,
        'likeCount': 156,
        'createTime': '2024-01-25'
    },
    'a4': {
        'id': 'a4',
        'title': '咏六堡茶诗选',
        'type': '茶诗',
        'coverImage': '/miniprogram/images/poem.png',
        'content': '《咏六堡茶》——六堡香高韵亦长，红浓陈醇味难忘。一壶煮尽千秋事，半盏品来万里香。《茶船古道》——苍梧之野六堡乡，古道茶船下南洋。千山风雨千山月，一盏红汤念故乡。《老茶》——光阴藏进旧陶罐，一启封来满室兰。莫道此汤颜色重，其中滋味是清欢。《品六堡》——红浓汤色映金瓯，陈韵悠长入口柔。若问此茶何处好，梧州六堡最消愁。',
        'viewCount': 560,
        'likeCount': 42,
        'createTime': '2024-02-01'
    },
    'a5': {
        'id': 'a5',
        'title': '六堡茶的保健功效',
        'type': '养生',
        'coverImage': '/miniprogram/images/health.png',
        'content': '六堡茶具有祛湿解暑、助消化、降血脂等功效，长期饮用有益健康。尤其适合湿热地区人群饮用。现代研究表明，六堡茶在渥堆发酵过程中产生了丰富的微生物菌群，如黑曲霉、酵母菌等，这些益生菌能促进肠道蠕动，帮助分解油脂。同时，六堡茶中的茶多酚、茶黄素等物质具有较强的抗氧化活性，有助于清除自由基、延缓衰老。',
        'viewCount': 1850,
        'likeCount': 123,
        'createTime': '2024-02-05'
    },
    'a6': {
        'id': 'a6',
        'title': '六堡茶的陈化艺术',
        'type': '工艺',
        'coverImage': '/miniprogram/images/aging.png',
        'content': '六堡茶是"可以喝的古董"，陈化是其品质升华的关键过程。新制的六堡茶口感较为生涩，经过数年陈化，茶叶中的多酚类物质逐渐氧化，口感变得更加醇厚顺滑。陈化过程中会产生独特的"陈香"、"药香"、"木香"等香气。十年以上的老六堡，茶汤如红酒般红浓透亮，入口绵滑，回甘悠长，具有极高的品饮价值和收藏价值。',
        'viewCount': 980,
        'likeCount': 71,
        'createTime': '2024-02-10'
    },
    'a7': {
        'id': 'a7',
        'title': '六堡茶与茶船古道',
        'type': '历史',
        'coverImage': '/miniprogram/images/tea_road.png',
        'content': '茶船古道是六堡茶外运的重要水路通道。明清时期，六堡茶从合口街码头起运，用竹排或小船沿着六堡河、东安江、贺江，运到西江枢纽重镇——梧州。然后在梧州换装大船，沿着西江航道直达广州、香港，再远销南洋各地。这条水路全程约1200公里，耗时近一个月。沿途的码头、会馆、茶庄见证了六堡茶的辉煌贸易史。如今，茶船古道已成为重要的文化遗产，吸引着众多茶人前来寻访。',
        'viewCount': 720,
        'likeCount': 54,
        'createTime': '2024-02-15'
    },
    'a8': {
        'id': 'a8',
        'title': '六堡茶的品鉴技巧',
        'type': '冲泡',
        'coverImage': '/miniprogram/images/tasting.png',
        'content': '品鉴六堡茶主要从四个方面入手：观汤色、闻香气、品滋味、看叶底。好的六堡茶汤色红浓明亮，如琥珀般通透。香气纯正，带有独特的槟榔香、陈香或药香，无异味。滋味醇厚顺滑，有回甘，无杂味、无酸馊味。叶底柔软有弹性，色泽均匀，呈褐红色。',
        'viewCount': 1340,
        'likeCount': 98,
        'createTime': '2024-02-20'
    },
    'a9': {
        'id': 'a9',
        'title': '六堡茶的分类与等级',
        'type': '工艺',
        'coverImage': '/miniprogram/images/classification.png',
        'content': '六堡茶按制作工艺分为传统工艺六堡茶和现代工艺六堡茶。传统工艺采用"罨堆"、"双蒸双压"等方法，茶叶转化较慢，但层次感丰富。现代工艺采用人工渥堆发酵，发酵程度较高，陈化速度更快。按形态可分为散茶、紧压茶（饼、砖、沱）。按年份分为新茶（1-3年）、陈茶（3-10年）、老茶（10年以上）。',
        'viewCount': 620,
        'likeCount': 45,
        'createTime': '2024-02-25'
    },
    'a10': {
        'id': 'a10',
        'title': '六堡茶的储存方法',
        'type': '工艺',
        'coverImage': '/miniprogram/images/storage.png',
        'content': '储存六堡茶要注意"避光、防潮、防异味、通风透气"。最佳储存环境：温度20-30℃，湿度60%-75%。家庭储存可使用紫砂罐、陶罐或牛皮纸袋，不宜用密封袋长期储存，因为六堡茶需要适量氧气进行后发酵。',
        'viewCount': 1100,
        'likeCount': 82,
        'createTime': '2024-03-01'
    },
    'a11': {
        'id': 'a11',
        'title': '六堡茶名山名寨',
        'type': '历史',
        'coverImage': '/miniprogram/images/mountains.png',
        'content': '六堡茶的核心产区在广西梧州市苍梧县六堡镇，其中以"四柳"最为著名——黑石、恭州、蚕村、大宁。黑石村出产的茶叶香气高扬，有"黑石香"之称；恭州茶以茶气足著称；蚕村茶口感醇和；大宁茶汤色红亮。',
        'viewCount': 580,
        'likeCount': 38,
        'createTime': '2024-03-05'
    },
    'a12': {
        'id': 'a12',
        'title': '六堡茶与健康养生',
        'type': '养生',
        'coverImage': '/miniprogram/images/health.png',
        'content': '六堡茶不仅口感独特，更具有多种保健功效。中医认为六堡茶性温，具有祛湿解暑、消食化滞、调理肠胃的作用。现代医学研究表明，六堡茶中的茶多酚、茶黄素、茶红素等物质具有抗氧化、降血脂、降血糖、抗菌消炎等功效。六堡茶中的益生菌群有助于改善肠道菌群，促进消化吸收。',
        'viewCount': 1670,
        'likeCount': 112,
        'createTime': '2024-03-10'
    }
}

def get_articles_list(type_filter='', page=1, page_size=10):
    """获取文章列表"""
    articles_list = list(ARTICLES.values())
    
    if type_filter and type_filter != '全部':
        articles_list = [a for a in articles_list if a['type'] == type_filter]
    
    articles_list.sort(key=lambda x: x['createTime'], reverse=True)
    
    total = len(articles_list)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_articles = articles_list[start:end]
    
    return paginated_articles, total

def get_article_by_id(article_id):
    """根据ID获取文章"""
    article = ARTICLES.get(article_id)
    if article:
        # 增加浏览次数
        article['viewCount'] = article.get('viewCount', 0) + 1
    return article

def like_article(article_id):
    """点赞文章"""
    article = ARTICLES.get(article_id)
    if article:
        article['likeCount'] = article.get('likeCount', 0) + 1
    return article

def get_article_types():
    """获取文章类型列表"""
    return ARTICLE_TYPES