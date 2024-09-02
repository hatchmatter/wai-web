# save stdout and stderr to files
vercel deploy --prebuilt --token=$VERCEL_TOKEN >deployment-url.txt 2>error.txt
 
# check the exit code
code=$?
if [ $code -eq 0 ]; then
    # Now you can use the deployment url from stdout for the next step of your workflow
    deploymentUrl=`cat deployment-url.txt`
    echo "Aliasing domain for $deploymentUrl and $DOMAIN"
    vercel alias $deploymentUrl $DOMAIN --token=$VERCEL_TOKEN --scope=$TEAM
else
    # Handle the error
    errorMessage=`cat error.txt`
    echo "There was an error: $errorMessage"
fi