# Job Funnel TS

Automated tool for scraping job postings into a .xlsx files inspired by [Job Funnel](https://github.com/PaulMcInnis/JobFunnel) and written in Typescript.

## Usage

1. Ensure that you have Node 12.x+ installed and Yarn package manager available globally
1. Install Job Funnel as a global package: `yarn global add job-funnel`
1. Generate a new config file in a local folder: `job-funnel generate-config`
1. Update 'config.yaml' file and specify your LinkedIn credentials
1. Update 'pages' section in 'config.yaml' files with a list of LinkedIn search pages URLs. You can get a URL by running a search on [LinkedIn Jobs](https://www.linkedin.com/jobs/)
page and copying the URL of the results page
1. Run the crawlers: `job-funnel scan`
1. Export the results to 'report.xlsx' file: `job-funnel export`
1. If needed, run `job-funnel wipe-db` to wipe the cached job results database
1. Run `job-funnel --debug scan` to actually see the crawling process (sometimes useful for troubleshooting)
1. Run `job-funnel` without any parameters to see help

### Config Example

```yaml
crawlers:
  linkedin:
    pages:
      - https://www.linkedin.com/jobs/search/?f_E=2%2C3%2C4&f_TPR=r604800&geoId=90000070&keywords=qa%20analyst&location=New%20York%20City%20Metropolitan%20Area&f_TP=1%2C2&redirect=false&position=1&pageNum=0
      - https://www.linkedin.com/jobs/search/?distance=50&f_E=2%2C3%2C4&f_TPR=r86400&geoId=104047727&keywords=qa%20analyst&location=Jersey%20City%2C%20New%20Jersey%2C%20United%20States&f_TP=1%2C2&redirect=false&position=1&pageNum=0
      - https://www.linkedin.com/jobs/search?keywords=Qa%20tester&location=New%20York%20City%20Metropolitan%20Area&geoId=90000070&trk=public_jobs_jobs-search-bar_search-submit&redirect=false&position=1&pageNum=0
    credentials:
      username: foobar@gmail.com
      password: foobarbaz
```

## Development

### Installation

1. Ensure that you have Node 12.x+ installed and Yarn package manager available globally
1. Clone the repository: `git clone https://github.com/alehkot/job-funnel-ts.git`
1. Run `yarn install`
1. Run `cp config.yaml.sample config.yaml` to create your configuration file

## Running the crawlers

1. Update 'config.yaml' file and specify your LinkedIn credentials
1. Update 'pages' section in 'config.yaml' files with a list of LinkedIn search pages URLs
You can get a URL by running a search on [LinkedIn Jobs](https://www.linkedin.com/jobs/)
page and copying the URL of the results page
1. Use `yarn start-dev scan` to run a crawler
1. Use `yarn start-dev export` to export results into 'report.xlsx' file
(it's possible to run this command any number of times, subsequent
runs will just append new results to the database table)
1. Use `yarn start-dev wipe-db` to wipe the database
1. Use `yarn start-dev generate-config` to generate a new config file
1. Use `--debug` global flag to disable headless Puppeteer mode and increase artificial crawaling delays,
for example `yarn start-dev --debug scan`. It's useful for search pages URLs troubleshooting

## Notes

The development in the very early stages, so there might be considerable code changes going forward.
