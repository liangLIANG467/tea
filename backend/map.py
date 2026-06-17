# 默认数据（梧州市六堡茶核心产区）
DEFAULT_GARDENS = {
    'province': '广西',
    'center': {'latitude': 23.5985, 'longitude': 111.4228},
    'gardens': [
        {
            'id': 1,
            'name': '六堡镇茶园',
            'latitude': 23.5985,
            'longitude': 111.4228,
            'icon': '🌿',
            'distance': '0km',
            'description': '六堡茶核心产区，拥有千年种茶历史，是六堡茶的发源地。',
            'features': ['千年古树', '传统工艺', '槟榔香'],
            'address': '广西梧州市苍梧县六堡镇',
            'openingHours': '08:00-18:00',
            'phone': '0774-8888888'
        },
        {
            'id': 2,
            'name': '苍梧生态茶园',
            'latitude': 23.6123,
            'longitude': 111.4356,
            'icon': '🌱',
            'distance': '2.5km',
            'description': '现代化生态茶园，采用有机种植方式，年产优质六堡茶50吨。',
            'features': ['有机种植', '生态示范', '观光体验'],
            'address': '广西梧州市苍梧县六堡镇苍梧茶园',
            'openingHours': '08:00-18:00',
            'phone': '0774-1234567'
        },
        {
            'id': 3,
            'name': '六堡茶博园',
            'latitude': 23.5856,
            'longitude': 111.4089,
            'icon': '🏛️',
            'distance': '3.8km',
            'description': '六堡茶文化博物馆和体验中心，展示六堡茶历史文化和制作工艺。',
            'features': ['文化展示', '制茶体验', '品茗休闲'],
            'address': '广西梧州市苍梧县六堡镇茶博园',
            'openingHours': '09:00-17:00',
            'phone': '0774-7654321'
        },
        {
            'id': 4,
            'name': '黑石山茶园',
            'latitude': 23.6200,
            'longitude': 111.4500,
            'icon': '⛰️',
            'distance': '5.2km',
            'description': '六堡茶核心产区之一的黑石山，以产高品质六堡茶闻名。',
            'features': ['高山茶', '传统工艺', '精品六堡'],
            'address': '广西梧州市苍梧县六堡镇黑石山',
            'openingHours': '08:00-17:00',
            'phone': '0774-6666666'
        },
        {
            'id': 5,
            'name': '恭州村茶园',
            'latitude': 23.5750,
            'longitude': 111.4000,
            'icon': '🏡',
            'distance': '4.5km',
            'description': '六堡镇"四柳"之一的恭州村，以茶气足、口感醇厚著称。',
            'features': ['恭州茶', '茶气足', '传统工艺'],
            'address': '广西梧州市苍梧县六堡镇恭州村',
            'openingHours': '08:00-18:00',
            'phone': '0774-5555555'
        },
        {
            'id': 6,
            'name': '蚕村茶园',
            'latitude': 23.5900,
            'longitude': 111.4150,
            'icon': '🌾',
            'distance': '3.2km',
            'description': '六堡镇"四柳"之一的蚕村，出产的茶叶口感醇和。',
            'features': ['蚕村茶', '口感醇和', '传统工艺'],
            'address': '广西梧州市苍梧县六堡镇蚕村',
            'openingHours': '08:00-17:30',
            'phone': '0774-4444444'
        },
        {
            'id': 7,
            'name': '大宁村茶园',
            'latitude': 23.6050,
            'longitude': 111.4280,
            'icon': '🌳',
            'distance': '1.8km',
            'description': '六堡镇"四柳"之一的大宁村，茶汤色红亮，品质优良。',
            'features': ['大宁茶', '汤色红亮', '品质优良'],
            'address': '广西梧州市苍梧县六堡镇大宁村',
            'openingHours': '08:00-18:00',
            'phone': '0774-3333333'
        }
    ]
}

# 各省茶园数据
TEA_GARDENS = {
    'guangxi': DEFAULT_GARDENS,
    'yunnan': {
        'province': '云南',
        'center': {'latitude': 22.9876, 'longitude': 101.0123},
        'gardens': [
            {'id': 8, 'name': '普洱古茶园', 'latitude': 22.9876, 'longitude': 101.0123, 'icon': '🌳', 'distance': '0km', 'description': '世界文化遗产地，拥有千年古茶树群。', 'features': ['千年古树', '普洱茶'], 'address': '云南普洱市宁洱县', 'openingHours': '08:30-18:30', 'phone': '0879-6666666'},
            {'id': 9, 'name': '景迈山茶园', 'latitude': 22.1956, 'longitude': 100.0234, 'icon': '🌄', 'distance': '8.2km', 'description': '全球重要农业文化遗产，景迈山古茶林。', 'features': ['世界遗产', '古茶林'], 'address': '云南普洱市澜沧县', 'openingHours': '09:00-17:00', 'phone': '0879-5555555'}
        ]
    },
    'fujian': {
        'province': '福建',
        'center': {'latitude': 27.7567, 'longitude': 117.9857},
        'gardens': [
            {'id': 10, 'name': '武夷山岩茶基地', 'latitude': 27.7567, 'longitude': 117.9857, 'icon': '⛰️', 'distance': '0km', 'description': '世界文化与自然双重遗产，大红袍发源地。', 'features': ['世界遗产', '岩韵', '大红袍'], 'address': '福建武夷山市', 'openingHours': '08:00-18:00', 'phone': '0599-8888888'},
            {'id': 11, 'name': '铁观音茶山', 'latitude': 25.1234, 'longitude': 117.8765, 'icon': '🍃', 'distance': '12.3km', 'description': '安溪铁观音核心产区，中国十大名茶之一。', 'features': ['铁观音', '兰花香'], 'address': '福建泉州市安溪县', 'openingHours': '08:30-17:30', 'phone': '0595-6666666'}
        ]
    },
    'zhejiang': {
        'province': '浙江',
        'center': {'latitude': 30.1245, 'longitude': 120.1234},
        'gardens': [
            {'id': 12, 'name': '龙井茶园', 'latitude': 30.1245, 'longitude': 120.1234, 'icon': '🍵', 'distance': '0km', 'description': '西湖龙井核心产区，中国绿茶代表。', 'features': ['西湖龙井', '狮峰山'], 'address': '浙江杭州市西湖区', 'openingHours': '08:30-17:30', 'phone': '0571-8888888'},
            {'id': 13, 'name': '安吉白茶园', 'latitude': 30.5678, 'longitude': 119.5678, 'icon': '🌿', 'distance': '8.5km', 'description': '安吉白茶核心产区，氨基酸含量高。', 'features': ['安吉白茶', '氨基酸'], 'address': '浙江湖州市安吉县', 'openingHours': '08:00-17:00', 'phone': '0572-7777777'}
        ]
    },
    'anhui': {
        'province': '安徽',
        'center': {'latitude': 30.4567, 'longitude': 118.0234},
        'gardens': [
            {'id': 14, 'name': '黄山毛峰茶园', 'latitude': 30.4567, 'longitude': 118.0234, 'icon': '🏔️', 'distance': '0km', 'description': '黄山毛峰核心产区，中国十大名茶之一。', 'features': ['黄山毛峰', '黄山云雾'], 'address': '安徽黄山市徽州区', 'openingHours': '08:00-18:00', 'phone': '0559-8888888'},
            {'id': 15, 'name': '祁门红茶园', 'latitude': 29.8765, 'longitude': 117.6543, 'icon': '🌹', 'distance': '10.2km', 'description': '祁门红茶核心产区，世界三大高香红茶之一。', 'features': ['祁门红茶', '高香'], 'address': '安徽黄山市祁门县', 'openingHours': '08:30-17:30', 'phone': '0559-6666666'}
        ]
    },
    'sichuan': {
        'province': '四川',
        'center': {'latitude': 30.5678, 'longitude': 103.4567},
        'gardens': [
            {'id': 16, 'name': '蒙顶山茶园', 'latitude': 30.5678, 'longitude': 103.4567, 'icon': '⛰️', 'distance': '0km', 'description': '中国茶文化发源地之一，蒙顶山茶千年贡茶。', 'features': ['茶文化发源', '蒙顶甘露'], 'address': '四川雅安市名山区', 'openingHours': '08:00-18:00', 'phone': '0835-8888888'},
            {'id': 17, 'name': '峨眉山茶园', 'latitude': 29.6543, 'longitude': 103.3210, 'icon': '🏔️', 'distance': '15.3km', 'description': '峨眉山茶区，世界文化与自然遗产。', 'features': ['峨眉山', '竹叶青'], 'address': '四川乐山市峨眉山市', 'openingHours': '08:30-17:30', 'phone': '0833-7777777'}
        ]
    },
    'guizhou': {
        'province': '贵州',
        'center': {'latitude': 26.5678, 'longitude': 106.1234},
        'gardens': [
            {'id': 18, 'name': '都匀毛尖茶园', 'latitude': 26.5678, 'longitude': 106.1234, 'icon': '🍃', 'distance': '0km', 'description': '都匀毛尖核心产区，中国十大名茶之一。', 'features': ['都匀毛尖', '贵州绿茶'], 'address': '贵州黔南州都匀市', 'openingHours': '08:00-18:00', 'phone': '0854-8888888'}
        ]
    },
    'hunan': {
        'province': '湖南',
        'center': {'latitude': 28.1234, 'longitude': 112.5678},
        'gardens': [
            {'id': 19, 'name': '君山银针茶园', 'latitude': 28.1234, 'longitude': 112.5678, 'icon': '🌱', 'distance': '0km', 'description': '君山银针核心产区，中国十大名茶之一。', 'features': ['君山银针', '黄茶'], 'address': '湖南岳阳市君山区', 'openingHours': '08:30-17:30', 'phone': '0730-8888888'}
        ]
    },
    'jiangsu': {
        'province': '江苏',
        'center': {'latitude': 32.0123, 'longitude': 120.5678},
        'gardens': [
            {'id': 20, 'name': '碧螺春茶园', 'latitude': 32.0123, 'longitude': 120.5678, 'icon': '🍃', 'distance': '0km', 'description': '洞庭碧螺春核心产区，中国十大名茶之一。', 'features': ['碧螺春', '洞庭山'], 'address': '江苏苏州市吴中区太湖', 'openingHours': '08:00-18:00', 'phone': '0512-8888888'}
        ]
    },
    'henan': {
        'province': '河南',
        'center': {'latitude': 33.4567, 'longitude': 113.1234},
        'gardens': [
            {'id': 21, 'name': '信阳毛尖茶园', 'latitude': 33.4567, 'longitude': 113.1234, 'icon': '🌿', 'distance': '0km', 'description': '信阳毛尖核心产区，中国十大名茶之一。', 'features': ['信阳毛尖', '豫毛峰'], 'address': '河南信阳市浉河区', 'openingHours': '08:00-18:00', 'phone': '0376-8888888'}
        ]
    },
    # 新增省份
    'hubei': {
        'province': '湖北',
        'center': {'latitude': 30.2345, 'longitude': 110.0123},
        'gardens': [
            {'id': 22, 'name': '恩施玉露茶园', 'latitude': 30.2345, 'longitude': 110.0123, 'icon': '🍵', 'distance': '0km', 'description': '保留唐代蒸青工艺，湖北历史名茶。', 'features': ['蒸青绿茶', '恩施富硒'], 'address': '湖北恩施市芭蕉乡', 'openingHours': '08:00-18:00', 'phone': '0718-8888888'},
            {'id': 23, 'name': '赤壁青砖茶基地', 'latitude': 29.7654, 'longitude': 113.6789, 'icon': '🧱', 'distance': '11.6km', 'description': '赤壁青砖茶原产地，传统紧压黑茶。', 'features': ['青砖茶', '边销茶'], 'address': '湖北咸宁市赤壁市', 'openingHours': '08:30-17:30', 'phone': '0715-7777777'}
        ]
    },
    'guangdong': {
        'province': '广东',
        'center': {'latitude': 23.6789, 'longitude': 113.5678},
        'gardens': [
            {'id': 24, 'name': '凤凰山单丛茶园', 'latitude': 23.6789, 'longitude': 113.5678, 'icon': '⛰️', 'distance': '0km', 'description': '凤凰单丛核心产区，香型丰富多变。', 'features': ['凤凰单丛', '高山乌龙'], 'address': '广东潮州市潮安区凤凰镇', 'openingHours': '08:00-18:00', 'phone': '0768-8888888'},
            {'id': 25, 'name': '英德红茶园', 'latitude': 24.1234, 'longitude': 113.2345, 'icon': '🍂', 'distance': '22.3km', 'description': '英红九号原产地，广东知名红茶。', 'features': ['英红九号', '蜜香红茶'], 'address': '广东清远英德市', 'openingHours': '08:30-17:30', 'phone': '0763-6666666'}
        ]
    },
    'jiangxi': {
        'province': '江西',
        'center': {'latitude': 28.5678, 'longitude': 115.6789},
        'gardens': [
            {'id': 26, 'name': '庐山云雾茶园', 'latitude': 28.5678, 'longitude': 115.6789, 'icon': '🏔️', 'distance': '0km', 'description': '庐山高山云雾茶，清香鲜爽。', 'features': ['高山云雾', '绿茶'], 'address': '江西九江市庐山市', 'openingHours': '08:00-18:00', 'phone': '0792-8888888'},
            {'id': 27, 'name': '遂川狗牯脑茶园', 'latitude': 26.3456, 'longitude': 114.5678, 'icon': '🌱', 'distance': '35.7km', 'description': '江西历史贡茶，滋味醇厚回甘。', 'features': ['狗牯脑', '名优绿茶'], 'address': '江西吉安市遂川县', 'openingHours': '08:30-17:00', 'phone': '0796-5555555'}
        ]
    },
    'shandong': {
        'province': '山东',
        'center': {'latitude': 36.4567, 'longitude': 120.8901},
        'gardens': [
            {'id': 28, 'name': '崂山绿茶园', 'latitude': 36.4567, 'longitude': 120.8901, 'icon': '🌿', 'distance': '0km', 'description': '北方高纬度茶园，茶汤鲜爽耐泡。', 'features': ['北方茶区', '崂山绿茶'], 'address': '山东青岛市崂山区', 'openingHours': '08:00-18:00', 'phone': '0532-8888888'}
        ]
    },
    'shanxi': {
        'province': '陕西',
        'center': {'latitude': 32.7890, 'longitude': 108.5678},
        'gardens': [
            {'id': 29, 'name': '紫阳富硒茶园', 'latitude': 32.7890, 'longitude': 108.5678, 'icon': '🍃', 'distance': '0km', 'description': '北方富硒茶产区，紫阳毛尖清香回甘。', 'features': ['富硒茶', '紫阳毛尖'], 'address': '陕西安康紫阳县', 'openingHours': '08:00-18:00', 'phone': '0915-8888888'}
        ]
    },
    'taiwan': {
        'province': '台湾',
        'center': {'latitude': 23.475537, 'longitude': 120.696485},
        'gardens': [
            {'id': 30, 'name': '阿里山高山茶园', 'latitude': 24.1234, 'longitude': 121.6789, 'icon': '☁️', 'distance': '0km', 'description': '阿里山高山乌龙，香气清雅绵长。', 'features': ['高山乌龙', '奶香果香'], 'address': '台湾嘉义阿里山乡', 'openingHours': '全天观光采摘时段08:00-17:00', 'phone': '05-2888888'}
        ]
    }
}

# 省份列表（同步新增全部省份）
PROVINCES = [
    {'id': 'guangxi', 'name': '广西'},
    {'id': 'yunnan', 'name': '云南'},
    {'id': 'fujian', 'name': '福建'},
    {'id': 'zhejiang', 'name': '浙江'},
    {'id': 'anhui', 'name': '安徽'},
    {'id': 'sichuan', 'name': '四川'},
    {'id': 'guizhou', 'name': '贵州'},
    {'id': 'hunan', 'name': '湖南'},
    {'id': 'jiangsu', 'name': '江苏'},
    {'id': 'henan', 'name': '河南'},
    {'id': 'hubei', 'name': '湖北'},
    {'id': 'guangdong', 'name': '广东'},
    {'id': 'jiangxi', 'name': '江西'},
    {'id': 'shandong', 'name': '山东'},
    {'id': 'shanxi', 'name': '陕西'},
    {'id': 'taiwan', 'name': '台湾'}
]

if __name__ == "__main__":
    # 简易测试代码
    total_garden = 0
    for p in TEA_GARDENS.values():
        total_garden += len(p["gardens"])
    print(f"全国收录茶园总数量：{total_garden} 处")
    print(f"覆盖省份总数：{len(PROVINCES)} 个")
    print("广西第一处茶园：", TEA_GARDENS["guangxi"]["gardens"][0]["name"])