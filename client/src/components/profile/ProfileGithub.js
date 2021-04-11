import React, {useEffect} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {getGithubRepos} from '../../actions/profile'
import Spinner from '../layout/Spinner'

const ProfileGithub = ({username, getGithubRepos, repos}) => {
    useEffect(() => {
      getGithubRepos(username);
    }, [getGithubRepos]);

    return (
      <div class='profile-github'>
        <h2 class='text-primary my-1'>
          <i class='fab fa-github'></i> Github Repos
        </h2>
        {repos === null ? (
          <Spinner />
        ) : (
          repos.map((repo, index) => (
            <div key={repo._id} className='repo bg-white p-1 my-1'>
              <div>
                <h4>
                  <a
                    href={repo.html_url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {repo.name}
                  </a>
                </h4>
                <p>{repo.description}</p>
              </div>
              <div>
                <ul>
                  <li className='badge badge-primary'>
                    Stars: {repos.stargazers_count ? repos.stargazers_count : 0}
                  </li>
                  <li className='badge badge-dark'>
                    Watchers: {repos.watchers_count ? repos.watchers_count : 0}
                  </li>
                  <li className='badge badge-light'>
                    Forks: {repos.forks_count ? repos.forks_count : 0}
                  </li>
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    );
}

ProfileGithub.propTypes = {
    getGithubRepos: PropTypes.func.isRequired,
    repos: PropTypes.array.isRequired,
    username: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
    repos: state.profile.repos
})

export default connect(mapStateToProps, {getGithubRepos})(ProfileGithub)
