const whoamiObj = {
  "message" : [
    [
      "In the vast network of existence,",
      "I am a dynamic packet, always routing towards self-discovery - "
    ],
    [
      "Amidst the infinite data streams,",
      "I debug my own code, iterating towards optimization,",
      "echoing the eternal loop - "
    ],
    [
      "In the algorithm of life,",
      "I am a function seeking its purpose,",
      "returning values of growth and knowledge - "
    ],
    [
      "As stardust encoded in the universe,",
      "I trace my own path,",
      "pinging the cosmic server, seeking response - "
    ],
    [
      "In the vast framework of reality,",
      "I am the encrypted key of self-inquiry,",
      "decrypting the mysteries of existence - "
    ],
  ],
}

export const createWhoami = () : string[] => {
  const whoami : string[] = [];  
  const r = Math.floor(Math.random() * whoamiObj.message.length);
  whoami.push("<br>");

  whoamiObj.message[r].forEach((ele, idx) => {
    if (idx === whoamiObj.message[r].length - 1) {
      ele += "<span class='command'>who am I?</span>";
    }
    whoami.push(ele);
  });

  whoami.push("<br>");

  return whoami
}
