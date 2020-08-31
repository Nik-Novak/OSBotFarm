docker rm mongo-express
docker run \
    --name mongo-express \
    -p 7200:8081 \
    -e ME_CONFIG_OPTIONS_EDITORTHEME="ambiance" \
    -e ME_CONFIG_MONGODB_SERVER="10.0.0.116" \
    -e ME_CONFIG_BASICAUTH_USERNAME="bottomfrag" \
    -e ME_CONFIG_BASICAUTH_PASSWORD="test123" \
    -e ME_CONFIG_MONGODB_PORT="7201" \
    mongo-express
