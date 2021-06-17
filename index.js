import { Octokit } from "octokit";
import fs from "fs/promises";
import path from "path";

const milestoneTitle = process.argv[2];

console.log(`Start generation for ${milestoneTitle}`);

const octokit = new Octokit({
	userAgent: "changelog-generator@1.0.0",
});

console.log('Fetching recent milestones...');

const milestones = await octokit.rest.issues.listMilestones({
	owner: "directus",
	repo: "directus",
	direction: "desc",
	state: "all",
	sort: "created_at",
});

console.log('Looking up milestone...');

const milestone = milestones.data.find(
	(milestone) => milestone.title === milestoneTitle
);

if (!milestone) {
	throw new Error(`Milestone ${milestoneTitle} doesn't exist`);
}

console.log('Fetching issues for repo...');

const issues = await octokit.rest.issues.listForRepo({
	owner: "directus",
	repo: "directus",
	milestone: milestone.number,
	state: "closed",
	per_page: 100,
});

console.log('Pulling / parsing pull requests...');

const pulls = issues.data
	.filter((issue) => {
		return issue.pull_request;
	})
	.map(pullToInfo);

const grouped = {
	features: {},
	improvements: {},
	bugs: {},
	documentation: [],
	dependencies: [],
};

const packageLabels = ["App", "API", "Docker"]; // and Package: <whatever>

for (const pull of pulls) {
	const directusPackages = pull.labels
		.filter(
			(label) => packageLabels.includes(label) || label.startsWith("Package: ")
		)
		.map((label) =>
			label.startsWith("Package: ") ? label.substring(9) : label
		);

	if (directusPackages.length === 0) {
		directusPackages.push("Misc.");
	}

	for (const directusPackage of directusPackages) {
		if (pull.labels.includes("New Feature")) {
			if (!grouped.features[directusPackage])
				grouped.features[directusPackage] = [];
			grouped.features[directusPackage].push(pull);
		}

		if (pull.labels.includes("Improvement")) {
			if (!grouped.improvements[directusPackage])
				grouped.improvements[directusPackage] = [];
			grouped.improvements[directusPackage].push(pull);
		}

		if (pull.labels.includes("Bug")) {
			if (!grouped.bugs[directusPackage]) grouped.bugs[directusPackage] = [];
			grouped.bugs[directusPackage].push(pull);
		}

		if (pull.labels.includes("Dependencies")) grouped.dependencies.push(pull);
		if (pull.labels.includes("Documentation")) grouped.documentation.push(pull);
	}
}

const date = new Date();

const dateString = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
}).format(date);

console.log('Generating markdown...');

let markdownOutput = `## ${milestoneTitle} (${dateString})`;

if (Object.keys(grouped.features).length > 0) {
	markdownOutput += "\n\n### :sparkles: New Features\n";
	markdownOutput += formatGroup(grouped.features);
}

if (Object.keys(grouped.improvements).length > 0) {
	markdownOutput += "\n\n### :rocket: Improvements\n";
	markdownOutput += formatGroup(grouped.improvements);
}

if (Object.keys(grouped.bugs).length > 0) {
	markdownOutput += "\n\n### :bug: Bug Fixes\n";
	markdownOutput += formatGroup(grouped.bugs);
}

if (Object.keys(grouped.documentation).length > 0) {
	markdownOutput += "\n\n### :memo: Documentation\n\n";
	markdownOutput += formatLines(grouped.documentation).join("\n");
}

if (Object.keys(grouped.dependencies).length > 0) {
	markdownOutput += "\n\n### :package: Dependency Updates\n\n";
	markdownOutput += formatLines(grouped.dependencies).join("\n");
}

console.log('Saving markdown to file...');

await fs.writeFile(
	path.join("./output", milestoneTitle + ".md"),
	markdownOutput
);

console.log('Done!');

console.log();
console.log('==============================================================');
console.log();
console.log();
console.log(markdownOutput);

function pullToInfo(pull) {
	return {
		title: pull.title,
		number: pull.number,
		link: pull.pull_request.html_url,
		author: pull.user.login,
		author_link: pull.user.html_url,
		labels: pull.labels.map((label) => label.name),
	};
}

function formatGroup(group) {
	let groupOutput = "";

	for (const [directusPackage, pulls] of Object.entries(group)) {
		groupOutput += `\n- **${directusPackage}**\n`;
		groupOutput += formatLines(pulls)
			.map((line) => `  ${line}`)
			.join("\n");
	}

	return groupOutput;
}

function formatLines(lines) {
	return lines.map(
		(pull) =>
			`- ${pull.labels.includes("Notice") ? ":warning: " : ""}[#${
				pull.number
			}](${pull.link}) ${pull.title} ([@${pull.author}](${pull.author_link}))`
	);
}
