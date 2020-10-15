# Job Funnel JS

Automated tool for scraping job postings into a .xlsx files inspired by [Job Funnel](https://github.com/PaulMcInnis/JobFunnel).

## Installation

1. Ensure that you have Node 12.x+ installed and Yarn package manager available globally
1. Clone the repository: `git clone https://github.com/alehkot/job-funnel-js.git`
1. Run `yarn install`
1. Run `cp config.yaml.sample config.yaml` to create your configuration file

## Usage (LinkedIn)

1. Update 'config.yaml' file and specify your LinkedIn credentials
1. Update 'pages' section in 'config.yaml' files with a list of LinkedIn search pages URLs.
You can get a URL by running a search on [LinkedIn Jobs](https://www.linkedin.com/jobs/)
page and copying the URL of the results page.
1. Use `yarn start-dev scan` to run a crawler
1. Use `yarn start-dev export` to export results into 'report.xlsx' file
(it's possible to run this command any number of times, subsequent
runs will just append new results to the database table)
1. Use `yarn start-dev wipe-db` to wipe the database
1. Use `yarn start-dev generate-config` to generate a new config file.

### Using NPX

1. An alternate option to run Job Funnel JS is by using NPX: `npx job-funnel` should work the same
way as described above.

## Roadmap

- [ ] Support Monster
- [ ] Support Indeed
- [ ] Support Glassdoor
- [ ] Support ZipRecruiter
- [ ] Make Puppeteer configurable using 'config.yml' file
- [x] Add command to generate 'config.yml' file

## Contribution

1. The development in the very early stages, so there might be considerable code changes going forward.
