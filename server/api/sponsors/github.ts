interface GitHubSponsor {
  name: string;
  login: string;
  avatarUrl: string;
  url: string;
  createdAt: string;
  isActive: boolean;
}

interface GitHubResponse {
  errors: any;
  data: {
    viewer: {
      sponsorshipsAsMaintainer: {
        totalCount: number;
        pageInfo: {
          endCursor: string;
        };
        nodes: Array<{
          sponsorEntity: {
            name: string;
            login: string;
            avatarUrl: string;
            url: string;
          };
          createdAt: string;
          privacyLevel: string;
          isActive: boolean;
        }>;
      };
    };
  };
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const token = config.GITHUB_TOKEN;

  if (!config.GITHUB_TOKEN) {
    console.error("GitHub token not configured");
    throw createError({
      statusCode: 500,
      message: "GitHub API configuration missing",
    });
  }

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
        {
            viewer {
                sponsorshipsAsMaintainer(first: 100, activeOnly: false, orderBy: {field: CREATED_AT, direction: ASC}, includePrivate: false) {
                    totalCount
                    pageInfo {
                        endCursor
                    }
                    nodes {
                        sponsorEntity {
                            ... on User {
                                name
                                login
                                avatarUrl
                                url
                            }
                            ... on Organization {
                                name
                                login
                                avatarUrl
                                url
                            }
                        }
                        createdAt
                        privacyLevel
                        isActive
                    }
                }
            }
        }`,
      }),
    });

    const data = (await response.json()) as GitHubResponse;

    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      throw createError({
        statusCode: 401,
        message: "GitHub API authentication failed",
      });
    }

    const sponsors = data.data.viewer.sponsorshipsAsMaintainer.nodes.map(
      (node): GitHubSponsor => ({
        name: node.sponsorEntity.name,
        login: node.sponsorEntity.login,
        avatarUrl: node.sponsorEntity.avatarUrl,
        url: node.sponsorEntity.url,
        createdAt: node.createdAt,
        isActive: node.isActive,
      })
    );

    return {
      totalCount: data.data.viewer.sponsorshipsAsMaintainer.totalCount,
      sponsors,
    };
  } catch (error) {
    console.error("Failed to fetch sponsors:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch sponsors data",
    });
  }
});
