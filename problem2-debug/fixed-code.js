async function getPage(url) {
  const response = await fetch(url);
  return response.text();
}

async function getYoutubeData(youtubeIds) {
  const promises = [];

  // use `let` to make each iteration have its own i
  for (let i = 0; i < youtubeIds.length; i++) {
    promises.push(
      (async () => {
        const id = youtubeIds[i];
        const channelURL = `https://www.youtube.com/${id}`;
        const channelPage = await getPage(channelURL);

        const videosURL = `https://www.youtube.com/${id}/videos`;
        const videosPage = await getPage(videosURL);

        return { channelPage, videosPage };
      })()
    );
  }

  return Promise.all(promises);
}

const youtubeIds = ["@darbbq", "@oojimateru", "@homemeat_clip"];
getYoutubeData(youtubeIds).then(console.log).catch(console.error);
