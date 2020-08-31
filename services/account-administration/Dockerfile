FROM ubuntu:19.10

ENV BASEDIR=/root
ENV SYSTEM_STATUS_DIR=/var/lib/systemstatus

WORKDIR ${BASEDIR}

SHELL ["/bin/bash", "-l", "-c"]

RUN apt-get -y update

#Set timezone manually since mono-runtime requires it and will ask during install otherwise
RUN echo 'US/Eastern' >/etc/timezone && apt-get install --reinstall tzdata 

RUN apt-get install -y \
    git \
    curl \
    mono-runtime

RUN mkdir -p ${SYSTEM_STATUS_DIR}

# Installing Node
SHELL ["/bin/bash", "--login", "-i", "-c"]
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
RUN source /root/.bashrc && nvm install 12.14.1
SHELL ["/bin/bash", "--login", "-c"]

# Installing start and worker scripts
ADD ./internal-scripts ${BASEDIR}
RUN chmod +x *

ADD ./modules /modules
ADD ./openapi-server ./openapi-server

CMD [ "/bin/bash", "--login", "-c", "./start" ]