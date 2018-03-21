import axios from 'axios';

const url: string = 'http://localhost:3000/api';

export const createContainer = (token: string, imageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/containers/create`,  {
        imageName,
      }, {headers: {'x-access-token': token}});
      console.log(response.data.id);
    } catch (error) {
      console.log('unable to create container');
    }
  })();
};

export const startContainer = (token: string, containerId: string) => {
  (async () => {
    try {
      await axios.post(`${url}/containers/start`,  {
        containerId,
      }, {headers: {'x-access-token': token}});
      console.log('container started');
    } catch (error) {
      console.log('unable to start container');
    }
  })();
};

export const stopContainer = (token: string, containerId: string) => {
  (async () => {
    try {
      await axios.post(`${url}/containers/stop`,  {
        containerId,
      }, {headers: {'x-access-token': token}});
      console.log('container stopped');
    } catch (error) {
      console.log('unable to stop container');
    }
  })();
};

export const removeContainer = (token: string, containerId: string) => {
  (async () => {
    try {
      await axios.delete(`${url}/containers/${containerId}`,
        {headers: {'x-access-token': token}});
      console.log('container removed');
    } catch (error) {
      console.log('unable to remove container');
    }
  })();
};

export const extractContainer = (token: string, containerId: string, imageName: string) => {
  (async () => {
    try {
      await axios.post(`${url}/containers/extract`,  {
        containerId,
        imageName,
      }, {headers: {'x-access-token': token}});
      console.log('container extracted');
    } catch (error) {
      console.log('unable to extract container');
    }
  })();
};

export const checkForVulnComps = (token: string, imageName: string, checkOnly: boolean) => {
  (async () => {
    try {
      const response = await axios.put(`${url}/imagefreshness`,  {
        checkOnly, imageName,
      }, {headers: {'x-access-token': token}});
      console.log(response.data.updates);
    } catch (error) {
      console.log('unable to perform vulnerability check');
    }
  })();
};

export const performVulnerabilityCheck = (token: string, imageName: string) => {
  (async () => {
    try {
      const response = await axios.put(`${url}/imagefreshness`,  {
        imageName,
      }, {headers: {'x-access-token': token}});
      console.log({updates: response.data});
    } catch (error) {
      console.log('unable to perform vulnerability check');
    }
  })();
};

export const pullImage = (token: string, imageName: string) => {
  (async () => {
    try {
      await axios.post(`${url}/images/pull`,  {
        imageName,
      }, {headers: {'x-access-token': token}});
      console.log('image successfully pulled');
    } catch (error) {
      console.log('unable to pull image' + imageName);
    }
  })();
};

export const removeImage = (token: string, imageId: string) => {
  (async () => {
    try {
      await axios.delete(`${url}/images/${imageId}`,
        {headers: {'x-access-token': token}});
      console.log('Image removed successfully');
    } catch (error) {
      console.log('unable to remove image');
    }
  })();
};

export const runNpmTests = (token: string, imageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/src/tests`,  {
        imageName,
      }, {headers: {'x-access-token': token}});
      console.log(response.data);
    } catch (error) {
      console.log('Unable to run npm tests');
    }
  })();
};

export const runNcuCheck = (token: string, imageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/src/checkUpdates`,  {
        imageName,
      }, {headers: {'x-access-token': token}});
      console.log(response.data);
    } catch (error) {
      console.log('Unable to check for npm updates');
    }
  })();
};

export const updateNpmComponents = (token: string, imageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/src/update`,  {
        imageName,
      }, {headers: {'x-access-token': token}});
      console.log(response.data);
    } catch (error) {
      console.log('Unable to update components');
    }
  })();
};

export const updateNpmComponent = (token: string, imageName: string, packageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/src/update`,  {
        imageName,
        packageName,
      }, {headers: {'x-access-token': token}});
      console.log(response.data);
    } catch (error) {
      console.log('Unable to update components');
    }
  })();
};

export const updateAndReinstall = (token: string, imageName: string, packageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/src/update`,  {
        imageName,
        packageName,
        reinstall: true,
      }, {headers: {'x-access-token': token}});
      console.log(response.data);
    } catch (error) {
      console.log('Unable to update components');
    }
  })();
};

export const removeSrcCode = (token: string, imageName: string) => {
  (async () => {
    try {
      await axios.delete(`${url}/src/${imageName}`,
         {headers: {'x-access-token': token}});
      console.log('Source code successfully removed');
    } catch (error) {
      console.log('Unable to remove source code');
    }
  })();
};

export const dockerLogin = (token: string, username: string, password: string) => {
  (async () => {
    try {
      await axios.post(`${url}/dockerLogin`,  {
        password,
        username,
      }, {headers: {'x-access-token': token}});
      console.log('Login Successful');
    } catch (error) {
      console.log('Incorrect login and/or password');
    }
  })();
};

export const buildImage = (token: string, imageName: string) => {
  (async () => {
    try {
      await axios.post(`${url}/images/build`,  {
        imageName,
      }, {headers: {'x-access-token': token}});
      console.log('Image successfully built');
    } catch (error) {
      console.log('Unable to build image');
    }
  })();
};

export const pushImage = (token: string, imageName: string) => {
  (async () => {
    try {
      await axios.post(`${url}/images/push`,  {
        imageName,
      }, {headers: {'x-access-token': token}});
      console.log('Image pushed to DockerHub');
    } catch (error) {
      console.log('Unable to push image');
    }
  })();
};

export const checkTag = (token: string, imageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/images/checkTag`,  {
        imageName,
      }, {headers: {'x-access-token': token}});
      console.log(response.data);
    } catch (error) {
      console.log('Unable to push image');
    }
  })();
};

export const login = (username: string, password: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/login`,  {
        password,
        username,
      });
      console.log(response.data.token);
    } catch (error) {
      console.log('Unable to login');
    }
  })();
};

export const register = (username: string, password: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/register`,  {
        password,
        username,
      });
      console.log(response.data.token);
    } catch (error) {
      console.log('Unable to register');
    }
  })();
};
