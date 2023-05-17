export const getVMs = async (token) => {
  const res = await fetch(process.env.REACT_APP_DEPLOY_API_URL + "/vms", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const response = await res.json();
  const result = response.map((obj) => ({ ...obj, type: "vm" }));
  if (Array.isArray(result)) return result;
  else throw new Error("Error getting VMs, response was not an array");
};

export const deleteVM = async (id, token) => {
  const res = await fetch(process.env.REACT_APP_DEPLOY_API_URL + "/vms/" + id, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (!res.ok) throw res;

  return await res.json();
};

export const attachGPU = async (vm, token) => {
  const res = await fetch(
    process.env.REACT_APP_DEPLOY_API_URL +
      "/" +
      vm.type +
      "s/" +
      vm.id +
      (!vm.gpu ? "/attachGpu" : "/detachGpu"),
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  if (!res.ok) throw res;
  return await res.json();
};

export const createVM = async (
  name,
  sshPublicKey,
  cpuCores,
  diskSize,
  ram,
  token
) => {
  const body = {
    name,
    sshPublicKey,
    cpuCores,
    diskSize,
    ram,
  };

  const res = await fetch(process.env.REACT_APP_DEPLOY_API_URL + "/vms", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw res;
  return await res.json();
};

export const updateVM = async (id, ports, cpuCores, ram, token) => {
  const body = {
    ports,
    cpuCores,
    ram,
  };

  const res = await fetch(process.env.REACT_APP_DEPLOY_API_URL + "/vms/" + id, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw res;
  return await res.json();
};
