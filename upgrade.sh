if [ "$TRAVIS_BRANCH" = "master" ]
then
    {
    echo "call $TRAVIS_BRANCH branch"
    ENV_ID=`curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL/v2-beta/projects?name=Default" | jq '.data[].id' | tr -d '"'`
    echo $ENV_ID
    USERNAME="$DOCKER_USERNAME";
    TAG="latest";
    MONGODB="$MONGODB";
    SECRET="$SECRET";
    RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY";
    RANCHER_SECRETKEY="$RANCHER_SECRETKEY";
    RANCHER_URL="$RANCHER_URL";
   
    SERVICE_NAME="$SERVICE_NAME";
    BACKEND_HOST="$BACKEND_HOST";
  }
else [ "$TRAVIS_BRANCH" = "develop" ]
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL/v2-beta/projects?name=Default" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      TAG="dev";
      MONGODB="$MONGODB";
      SECRET="$SECRET";
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY";
      RANCHER_URL="$RANCHER_URL";
      
      SERVICE_NAME="$SERVICE_NAME";   
      BACKEND_HOST="$BACKEND_HOST";
    }
fi
                                                                                                                                    http://172.23.0.1:5555/env/1a5/apps/add-service?serviceId=1s8&stackId=1st5&upgrade=true
SERVICE_ID_AUTH=`curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL/v2-beta/projects/$ENV_ID/services?name=$SERVICE_NAME" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_AUTH

curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
  "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:'$USERNAME'/node-express-auth-crud:'$TAG'","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "'"$BACKEND_HOST"'"},"ports": ["3001:3001/tcp"],"environment": {"MONGODB": "'"$MONGODB"'","SECRET": "'"$SECRET"'","DOMAINKEY":"'"$DOMAINKEY"'","accountSid":"'"$accountSid"'","authToken":"'"$authToken"'","no1":"'"$no1"'","FROM":"'"$FROM"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 3001,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
$RANCHER_URL/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_AUTH?action=upgrade
