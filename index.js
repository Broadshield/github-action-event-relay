
const core = require('@actions/core')
const github = require('@actions/github')
const YAML = require('yaml')

try {
    (async () => {
        const token = core.getInput('github_token')
        const destinationRepo = core.getInput('destination_repository')
        const eventType = core.getInput('event_type')
        const event = core.getInput('event') !== null ? JSON.loads(core.getInput('event')) : null
        const jsonPayload = core.getInput('extra_payload_json') !== null ? JSON.loads(core.getInput('extra_payload_json')) : null
        const yamlPayload = core.getInput('extra_payload_yaml') !== null ? YAML.loads(core.getInput('extra_payload_yaml')) : null

        const extraPayload = {
            ...jsonPayload,
            ...yamlPayload,
        }

        const [owner,repo] = destinationRepo.split('/')

        const { context, eventName } = github

        const ref_prefix = eventName === 'pull_request' ? 'refs/heads/' : ''

        const { ref } = context.payload.pull_request.head || context.payload

        const clientPayload = {
            origin_context: context,
            origin_eventName: eventName,
            event: event || context,
            extraPayload: extraPayload,
            token: token,
            repository: `${owner}/${repo}`,
            ref: `${ref_prefix}${ref}`,
        }

        const octokit = new github.GitHub(token)

        await octokit.repos.createDispatchEvent({
            owner: owner,
            repo: repo,
            client_payload: clientPayload,
            event_type: eventType,
        })
    })()
} catch (error) { core.setFailed(error.message) }