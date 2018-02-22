import axios from 'axios';

const url: string = 'http://localhost:3000/api';

export const createContainer = (name: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/containers/create`,  {
        name,
      });
      /* tslint:disable */ console.log(response.data.id); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('unable to create container'); /* tslint:enable */
    }
  })();
};

export const startContainer = (containerId: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/containers/start`,  {
        containerId,
      });
      /* tslint:disable */ console.log('container started'); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('unable to start container'); /* tslint:enable */
    }
  })();
};

export const stopContainer = (containerId: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/containers/stop`,  {
        containerId,
      });
      /* tslint:disable */ console.log('container stopped'); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('unable to stop container'); /* tslint:enable */
    }
  })();
};

export const removeContainer = (containerId: string) => {
  (async () => {
    try {
      const response = await axios.delete(`${url}/containers/${containerId}`);
      /* tslint:disable */ console.log('container removed'); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('unable to remove container'); /* tslint:enable */
    }
  })();
};

export const extractContainer = (containerId: string, imageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/containers/extract`,  {
        containerId,
        imageName,
      });
      /* tslint:disable */ console.log('container extracted');; /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('unable to extract container'); /* tslint:enable */
    }
  })();
};

export const performVulnerabilityCheck = (name: string) => {
  (async () => {
    try {
      const response = await axios.put(`${url}/imagefreshness`,  {
        name,
      });
      /* tslint:disable */ console.log('vulnerability check completed for: ' + name); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('unable to perform vulnerability check'); /* tslint:enable */
    }
  })();
};

export const pullImage = (imageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/images/pull`,  {
        imageName,
      });
      /* tslint:disable */ console.log('image successfully pulled'); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('unable to pull image' + imageName); /* tslint:enable */
    }
  })();
};

export const removeImage = (imageId: string) => {
  (async () => {
    try {
      const response = await axios.delete(`${url}/images/${imageId}`);
      /* tslint:disable */ console.log('Image removed successfully'); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('unable to remove image'); /* tslint:enable */
    }
  })();
};

export const runNpmTests = (imageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/npm/tests`,  {
        imageName,
      });
      /* tslint:disable */ console.log(response.data); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('Unable to run npm tests',); /* tslint:enable */
    }
  })();
};

export const removeSrcCode = (imageName: string) => {
  (async () => {
    try {
      const response = await axios.delete(`${url}/npm/src/${imageName}`);
      /* tslint:disable */ console.log('Source code successfully removed'); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('Unable to remove source code',); /* tslint:enable */
    }
  })();
};

export const dockerLogin = (username: string, password: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/misc/dockerLogin`,  {
        password,
        username,
      });
      /* tslint:disable */ console.log('Login Successful'); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('Incorrect login and/or password'); /* tslint:enable */
    }
  })();
};

export const buildImage = (imageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/images/build`,  {
        imageName,
      });
      /* tslint:disable */ console.log('Image successfully built'); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('Unable to build image'); /* tslint:enable */
    }
  })();
};

export const pushImage = (imageName: string) => {
  (async () => {
    try {
      const response = await axios.post(`${url}/images/push`,  {
        imageName,
      });
      /* tslint:disable */ console.log('Image pushed to DockerHub'); /* tslint:enable */
    } catch (error) {
      /* tslint:disable */ console.log('Unable to push image'); /* tslint:enable */
    }
  })();
};
