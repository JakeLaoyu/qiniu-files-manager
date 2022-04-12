FROM centos:centos7
# 更新源，用于安装 git 2.x，修复 --work-tree 不能和 --git-dir 同名问题
RUN yum -y install wget \
  && wget http://opensource.wandisco.com/centos/6/git/x86_64/wandisco-git-release-6-1.noarch.rpm
  && rpm -ivh wandisco-git-release-6-1.noarch.rpm
  && yum -y install git

# 安装 mongodb
RUN echo '[mongodb-org-4.2]
  name=MongoDB Repository
  baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/4.2/x86_64/
  gpgcheck=1
  enabled=1
  gpgkey=https://www.mongodb.org/static/pgp/server-4.2.asc' > /usr/share/nginx/html/index.html
  && yum install -y mongodb-org
  && service mongod start

# 创建目录
RUN mkdir -p /home/qim
  && cd /home/qim
  && git clone https://github.com/JakeLaoyu/qiniu-files-manager.git
WORKDIR /home
