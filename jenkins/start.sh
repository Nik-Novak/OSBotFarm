docker rm jenkins-server
docker run -it --name jenkins-server \
      -p 7300:8080 \
      -v $PWD/jenkins_home:/var/jenkins_home \
      osrsmillionaires.tk/jenkins-server
