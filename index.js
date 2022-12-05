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
  data.experiences.forEach((experience) => {
    lines.push(
      `- ${experience.company} \`(${experience.location} ${experience.locationIcon})\``
    );
  });

  lines.push("\n");

  lines.push(
    `The knowledge I've got from these companies lets me contribute to the community:\n`
  );
  
  lines.push(
    `- Publications`
  );
  data.publications.forEach((publication) => {
    lines.push(`  - [${publication.title}](${publication.link}) ✏️`);
  });
  lines.push(
    `- Conferences`
  );
  data.conferences.forEach((conference) => {
    lines.push(
      `  - [${conference.title} - ${conference.topic}](${
        conference.videoEmbed?.link || conference.link
      }) 🎙️`
    );
  });
  lines.push(
    `- Interviews`
  );
  data.interviews.forEach((interview) => {
    lines.push(
      `  - [${interview.title}](${interview.videoEmbed.link}) 📺`
    );
  });

  lines.push("\n");

  lines.push(
    `Despite the fact that I might be busy, I'm open to any offers/collaboartions and would be happy to reply.`
  );

  fs.writeFileSync(path.resolve("./README.md"), lines.join("\n"));
};

index();
