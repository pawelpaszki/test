#!/bin/bash  

declare -a names=("vuln-demo-1-node" "vuln-demo-2-node" "vuln-demo-3-node" "vuln-demo-4-node"  "vuln-demo-10-node" "docker-vuln-manager" "long-term-vuln-node-app" "single-medium-vuln-node" "single-low-vuln-node" "multi-vuln-node")
declare -a toUpdate=("vuln-demo-1-node" "docker-vuln-manager")
declare -a ids

TOKEN=$(difvm login admin password)
if [ "$TOKEN" == "Unable to login" ]; then
  TOKEN=$(difvm register admin password)
fi

for name in "${names[@]}";
do
  echo "*********************************************************"
  echo vulnerability check 'for' "$name"
  difvm pullImage $TOKEN pawelpaszki/"$name":latest
  CONTAINER_ID="$(difvm createContainer $TOKEN pawelpaszki/$name)"
  difvm startContainer $TOKEN $CONTAINER_ID
  difvm extractContainer $TOKEN $CONTAINER_ID pawelpaszki/"$name"
  # check if update is required
  if [[ " ${toUpdate[@]} " =~ " ${name} " ]]; then
    result="$(difvm checkForVuln $TOKEN pawelpaszki/"$name" true)"
    sudo echo "$result" > "results.json"
    sudo sed -e "s/'/\"/g" -e "s/updates:/\"updates\":/g" results.json > parsedOutput.json
    sudo jq -r '.[]' parsedOutput.json > updates.txt
    readarray updates < updates.txt
    # if updates available ...
    if [ "${#updates[@]}" -gt 0 ] ; then
      echo "test" results before updates...
      difvm runNpmTests $TOKEN pawelpaszki/"$name"
      for i in "${!updates[@]}"; do 
        echo updating "${updates[$i]}" ...
	if [ "$((i+1))" -lt "${#updates[@]}" ]; then
          difvm updateComponent $TOKEN pawelpaszki/"$name" "${updates[$i]}"
        fi
	if [ "$((i+1))" == "${#updates[@]}" ]; then
	  difvm updateAndReinstall $TOKEN pawelpaszki/"$name" "${updates[$i]}"
	fi
      done
      echo "test" results after updates...
      difvm runNpmTests $TOKEN pawelpaszki/"$name"
      # check tag and increment
      tag="$(difvm checkTag $TOKEN pawelpaszki/"$name")"
      sudo echo "$tag" > "results.json"
      sudo sed -e "s/'/\"/g" -e "s/major:/\"major\":/g" -e "s/minor:/\"minor\":/g" -e "s/patch:/\"patch\":/g" results.json > parsedOutput.json
      sudo jq '.[]' parsedOutput.json > tagValues.txt
      sudo sed -e "s/\"//g" tagValues.txt > tagValuesInt.txt
      readarray tagValues < tagValuesInt.txt
      tag="${tagValues[0]}"."${tagValues[1]}"."$((${tagValues[2]} + 1))"
      tagNoSpaces="$(echo $tag | tr -d ' ')"
      echo building new image: pawelpaszki/"$name":"$tagNoSpaces"
      difvm buildImage $TOKEN pawelpaszki/"$name":"$tagNoSpaces"
      echo pushing pawelpaszki/"$name" to Docker Hub
      difvm pushImage $TOKEN pawelpaszki/"$name"
    fi
  fi
  echo vulnerability check details "for" $name
  difvm persistVulnCheck $TOKEN pawelpaszki/"$name"
  ids+=($CONTAINER_ID)
done

for i in "${!ids[@]}"
do
  difvm stopContainer $TOKEN ${ids[$i]}
  difvm removeContainer $TOKEN ${ids[$i]}
done

sudo rm -rf imagesTestDir/*
sudo rm -rf parsedOutput.json
sudo rm -rf results.json
sudo rm -rf updates.txt
sudo rm -rf results1.json
sudo rm -rf tagValues.txt
sudo rm -rf tagValuesInt.txt

echo finished!
