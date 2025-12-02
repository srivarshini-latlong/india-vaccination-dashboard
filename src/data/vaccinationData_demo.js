import rawData from "./state_level_vaccination_august.json";
import stateIdMapping from "./stateIdMapping";

const vaccinationData = {};

rawData.forEach((item) => {
  const stateName = item.title;
  const id = stateIdMapping[stateName];
  if (id) {
    vaccinationData[id] = {
      name: stateName,
      partial: item.partial_vaccinated,
      total: item.totally_vaccinated,
      precaution: item["Precaution Dose"],
      overall: item.total
    };
  }
});

export default vaccinationData;
