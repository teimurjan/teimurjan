const fs = require("fs");
const path = require("path");

const { GraphQLClient, gql } = require("graphql-request");

const query = gql`
  {
    bios {
      fullName
      headline
      about
      location
      phoneNumber
      email
    }
    experiences(orderBy: startDate_DESC) {
      id
      company
      position
      startDate
      endDate
      location
      locationIcon
      description {
        html
      }
      logo {
        url(
          transformation: {
            image: { resize: { width: 200, height: 200, fit: clip } }
          }
        )
      }
    }
    publications {
      id
      title
      link
      date
    }
    conferences {
      id
      title
      topic
      link
      date
      videoEmbed {
        link
      }
    }
    interviews {
      id
      title
      date
      videoEmbed {
        link
        iframeOptions
      }
    }
  }
`;

const client = new GraphQLClient(process.env.GRAPH_CMS_URL);

const index = async () => {
  const lines = [];

  const data = await client.request(query);

  lines.push(`### Hi there 👋\n`);
  lines.push(`${data.bios[0].about}\n`);

  lines.push(
    `At the time you're reading that, I've worked at the following companies:\n`
  );
  lines.push("<table>");
  data.experiences.forEach((experience) => {
    lines.push(
      `<tr><td valign="center"><img width="16" src="${experience.logo.url}" />&nbsp; ${experience.company} <code>(${experience.location} ${experience.locationIcon})</code></td></tr>`
    );
  });
  lines.push("</table>");

  lines.push("<br />");

  lines.push(
    `The knowledge I've got from these companies lets me contribute to the community:\n`
  );

  lines.push(`|Publications ✏️|Conferences 🎙️|Interviews 📺|`);
  lines.push(`|-|-|-|`);

  const publications = [];
  data.publications.forEach((publication) => {
    publications.push(`[${publication.title}](${publication.link})`);
  });

  const conferences = [];
  data.conferences.forEach((conference) => {
    conferences.push(
      `[${conference.title} - ${conference.topic}](${
        conference.videoEmbed?.link || conference.link
      })`
    );
  });

  const interviews = [];
  data.interviews.forEach((interview) => {
    interviews.push(`[${interview.title}](${interview.videoEmbed.link})`);
  });

  const rowsCount = Math.max(
    publications.length,
    conferences.length,
    interviews.length
  );
  for (let index = 0; index < rowsCount; index++) {
    lines.push(
      `|${[publications, conferences, interviews]
        .map((array) => {
          return array[index] ?? "";
        })
        .join("|")}|`
    );
  }

  lines.push("\n");

  lines.push(
    `Despite the fact that I might be busy, I'm open to any offers/collaboartions and would be happy to reply.`
  );

  fs.writeFileSync(path.resolve("./README.md"), lines.join("\n"));
};

index();
