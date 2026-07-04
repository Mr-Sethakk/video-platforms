-- ============================================================
-- Movie Platform Database Schema
-- MySQL 8.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS movie_platform
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE movie_platform;

-- ============================================================
-- User table
-- ============================================================
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（BCrypt加密）',
    `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
    `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '角色: USER/ADMIN',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================================
-- Category table
-- ============================================================
CREATE TABLE IF NOT EXISTS `category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '分类描述',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- ============================================================
-- Movie table
-- ============================================================
CREATE TABLE IF NOT EXISTS `movie` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '电影ID',
    `title` VARCHAR(200) NOT NULL COMMENT '电影标题',
    `description` TEXT COMMENT '电影描述',
    `rating` DECIMAL(3,1) DEFAULT NULL COMMENT '评分',
    `year` INT DEFAULT NULL COMMENT '上映年份',
    `genre` VARCHAR(50) DEFAULT NULL COMMENT '类型',
    `director` VARCHAR(200) DEFAULT NULL COMMENT '导演',
    `actors` TEXT COMMENT '演员（逗号分隔）',
    `poster_url` VARCHAR(500) DEFAULT NULL COMMENT '海报URL',
    `duration` VARCHAR(20) DEFAULT NULL COMMENT '时长',
    `country` VARCHAR(50) DEFAULT NULL COMMENT '国家/地区',
    `deleted` INT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除, 1-已删除',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_genre` (`genre`),
    INDEX `idx_year` (`year`),
    INDEX `idx_rating` (`rating`),
    INDEX `idx_title` (`title`),
    INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='电影表';

-- ============================================================
-- Watchlist table
-- ============================================================
CREATE TABLE IF NOT EXISTS `watchlist` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `movie_id` BIGINT NOT NULL COMMENT '电影ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_movie` (`user_id`, `movie_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_movie_id` (`movie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏/观看列表';

-- ============================================================
-- Comment table
-- ============================================================
CREATE TABLE IF NOT EXISTS `comment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论ID',
    `movie_id` BIGINT NOT NULL COMMENT '电影ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `content` TEXT NOT NULL COMMENT '评论内容',
    `rating` DECIMAL(3,1) DEFAULT NULL COMMENT '打分',
    `parent_id` BIGINT DEFAULT NULL COMMENT '父评论ID（支持回复）',
    `likes` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_movie_id` (`movie_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ============================================================
-- Video table (user-uploaded videos for review)
-- ============================================================
CREATE TABLE IF NOT EXISTS `video` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '视频ID',
    `user_id` BIGINT NOT NULL COMMENT '上传用户ID',
    `title` VARCHAR(200) NOT NULL COMMENT '视频标题',
    `description` TEXT COMMENT '视频描述',
    `url` VARCHAR(500) NOT NULL COMMENT '视频URL',
    `cover_url` VARCHAR(500) DEFAULT NULL COMMENT '封面URL',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态: PENDING/APPROVED/REJECTED',
    `review_comment` VARCHAR(500) DEFAULT NULL COMMENT '审核意见',
    `reviewed_by` BIGINT DEFAULT NULL COMMENT '审核人ID',
    `reviewed_at` DATETIME DEFAULT NULL COMMENT '审核时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频表';

-- ============================================================
-- Tag table
-- ============================================================
CREATE TABLE IF NOT EXISTS `tag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '标签ID',
    `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- ============================================================
-- Video-Tag relation table
-- ============================================================
CREATE TABLE IF NOT EXISTS `video_tag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `video_id` BIGINT NOT NULL COMMENT '视频ID',
    `tag_id` BIGINT NOT NULL COMMENT '标签ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_video_tag` (`video_id`, `tag_id`),
    INDEX `idx_video_id` (`video_id`),
    INDEX `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频-标签关联表';

-- ============================================================
-- Insert default admin user (password: admin123, BCrypt encoded)
-- ============================================================
INSERT INTO `user` (`username`, `password`, `email`, `role`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5Eh', 'admin@movieplatform.com', 'ADMIN')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- ============================================================
-- Insert sample categories
-- ============================================================
INSERT INTO `category` (`name`, `description`) VALUES
('动作', '动作电影'),
('喜剧', '喜剧电影'),
('科幻', '科幻电影'),
('爱情', '爱情电影'),
('恐怖', '恐怖电影'),
('动画', '动画电影'),
('剧情', '剧情电影'),
('悬疑', '悬疑电影'),
('纪录片', '纪录片')
ON DUPLICATE KEY UPDATE `name` = `name`;

-- ============================================================
-- Insert sample movies
-- ============================================================
INSERT INTO `movie` (`title`, `description`, `rating`, `year`, `genre`, `director`, `actors`, `poster_url`, `duration`, `country`) VALUES
('肖申克的救赎', '希望让人自由。银行家安迪因被误判杀害妻子及其情人而入狱，凭借才智和毅力，他用二十年完成惊天越狱。', 9.7, 1994, '剧情', '弗兰克·德拉邦特', '蒂姆·罗宾斯, 摩根·弗里曼', '/posters/shawshank.jpg', '142分钟', '美国'),
('星际穿越', '爱是超越时空的力量。末世中，前NASA宇航员库珀为拯救人类，穿越虫洞前往未知星系寻找新家园。', 9.4, 2014, '科幻', '克里斯托弗·诺兰', '马修·麦康纳, 安妮·海瑟薇', '/posters/interstellar.jpg', '169分钟', '美国'),
('千与千寻', '不要忘记自己的名字。少女千寻误入神隐世界，为救变成猪的父母，在汤屋中成长与冒险。', 9.4, 2001, '动画', '宫崎骏', '柊瑠美, 入野自由', '/posters/spirited_away.jpg', '125分钟', '日本'),
('盗梦空间', '梦境的深入探索。道姆·柯布是专门潜入他人梦境窃取秘密的高手，为回家他接受了植入思想的不可能任务。', 9.3, 2010, '科幻', '克里斯托弗·诺兰', '莱昂纳多·迪卡普里奥, 约瑟夫·戈登-莱维特', '/posters/inception.jpg', '148分钟', '美国'),
('泰坦尼克号', '永恒的爱情。穷画家杰克和贵族少女罗丝在泰坦尼克号上相识相爱，然而巨轮撞上冰山沉没...', 9.4, 1997, '爱情', '詹姆斯·卡梅隆', '莱昂纳多·迪卡普里奥, 凯特·温斯莱特', '/posters/titanic.jpg', '194分钟', '美国'),
('三傻大闹宝莱坞', '追求卓越，成功自然会找上门。三个年轻人的大学生活，对印度教育体制的深刻反思。', 9.2, 2009, '喜剧', '拉库马·希拉尼', '阿米尔·汗, 马德哈万', '/posters/3idiots.jpg', '170分钟', '印度'),
('看不见的客人', '真相总是在细节中。一位成功企业家被指控谋杀情人，他与律师之间的较量层层反转。', 8.8, 2017, '悬疑', '奥里奥尔·保罗', '马里奥·卡萨斯, 安娜·瓦格纳', '/posters/contratiempo.jpg', '106分钟', '西班牙'),
('闪灵', '阿洛哈哈...恐怖源自内心。作家杰克带着妻儿来到与世隔绝的瞭望酒店当冬季管理员，一切开始变得诡异。', 8.3, 1980, '恐怖', '斯坦利·库布里克', '杰克·尼科尔森, 谢莉·杜瓦尔', '/posters/shining.jpg', '146分钟', '美国'),
('你的名字', '跨越时空的相遇。东京男高中生和乡下女高中生莫名身体互换，一段超越时空的爱情故事。', 8.4, 2016, '动画', '新海诚', '神木隆之介, 上白石萌音', '/posters/your_name.jpg', '106分钟', '日本'),
('楚门的世界', '如果人生是一场真人秀，你愿意醒来吗？楚门从小生活在一个巨大的摄影棚里却不自知。', 9.3, 1998, '剧情', '彼得·威尔', '金·凯瑞, 劳拉·琳妮', '/posters/truman_show.jpg', '103分钟', '美国'),
('复仇者联盟4', '终局之战。灭霸打了响指让宇宙一半生命消失，剩下的复仇者们必须集结完成最后的逆转。', 8.5, 2019, '动作', '安东尼·罗素', '小罗伯特·唐尼, 克里斯·埃文斯', '/posters/endgame.jpg', '181分钟', '美国'),
('龙猫', '只有小孩子才能看到龙猫。姐妹俩搬到乡下，遇到了各种森林精灵，尤其是憨态可掬的龙猫。', 9.2, 1988, '动画', '宫崎骏', '日高法子, 坂本千夏', '/posters/totoro.jpg', '86分钟', '日本')
ON DUPLICATE KEY UPDATE `title` = `title`;
