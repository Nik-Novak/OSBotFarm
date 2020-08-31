FROM ubuntu:19.10

ENV BASEDIR=/root
ENV DBHOME=${BASEDIR}/DreamBot
ENV GIT_SCRIPTS_BASEPATH_URL="https://git.osrsmillionaires.tk/scripts"
ENV GIT_CLIENTRESOURCES_BASEPATH_URL="https://git.osrsmillionaires.tk/client-resources"
ENV SYSTEM_STATUS_DIR=/var/lib/systemstatus

WORKDIR ${BASEDIR}/setup

SHELL ["/bin/bash", "-l", "-c"]

RUN apt-get update && \
    apt-get install -y \
    curl \
    libxrender1 libxtst6 libxi6 \
    git

RUN mkdir -p ${SYSTEM_STATUS_DIR}

# Installing Java
RUN curl -L -b "oraclelicense=a" http://download.oracle.com/otn-pub/java/jdk/8u131-b11/d54c1d3a095b4ff2b6607d096fa80163/jdk-8u131-linux-x64.tar.gz -O
RUN mkdir /opt/jdk
RUN tar -zxf jdk-*-linux-x64.tar.gz -C /opt/jdk
RUN update-alternatives --install /usr/bin/java java /opt/jdk/jdk*/bin/java 100
RUN update-alternatives --install /usr/bin/javac javac /opt/jdk/jdk*/bin/javac 100
RUN rm jdk-*-linux-x64.tar.gz

# Installing Node
SHELL ["/bin/bash", "--login", "-i", "-c"]
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
RUN source /root/.bashrc && nvm install 12.14.1
SHELL ["/bin/bash", "--login", "-c"]

# Installing DreamBot
WORKDIR ${BASEDIR}/DreamBot
RUN curl -L https://dreambot.org/DBLauncher.jar -O
RUN chmod +x DBLauncher.jar
WORKDIR ${BASEDIR}

# Credentials
ADD ./auth /var/lib/auth

# Installing start and worker scripts
ADD ./internal-scripts ${BASEDIR}
RUN chmod +x * scripts/*

# ADDING API
ADD ./openapi-server.tar.gz ${BASEDIR}

CMD [ "/bin/bash", "--login", "-c", "./start" ]
