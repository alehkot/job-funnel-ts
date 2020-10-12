# Job Funnel JS

Automated tool for scraping job postings into a .xlsx files inspired by [Job Funnel](https://github.com/PaulMcInnis/JobFunnel).

## Installation

1. Ensure that you have Node 12.x+ installed and Yarn package manager available globally
1. Clone the repository: `git clone https://github.com/alehkot/job-funnel-js.git`
1. Run `yarn install`
1. Run `cp config.yaml.sample config.yaml` to create your configuration file

## Usage (LinkedIn)

1. Update 'config.yaml' file and specify your LinkedIn credentials
1. Update 'pages' section in 'config.yaml' files with a list of LinkedIn search pages URLs. You can get a URL by running a search on [LinkedIn Jobs](https://www.linkedin.com/jobs/) page and copying the URL of the results page.
1. Use `yarn start-dev scan` to run a crawler
1. Use `yarn start-dev export` to export results into 'report.xlsx' file (it's possible to run this command any number of times, any subsequent run will just append new results to the database table)
1. Use `yarn start-dev wipedb` to wipe the database

## Roadmap

- [ ] Support Monster
- [ ] Support Indeed
- [ ] Support Glassdoor

## Contribution

1. The development in the very early stages, so there might be considerable code changes going forward. Please feel free to fork the project if you want.
