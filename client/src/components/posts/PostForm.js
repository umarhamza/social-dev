import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {addPost} from '../../actions/post'

const PostForm = ({ addPost, post, updatePostId }) => {
  const [formData, setFormData] = useState({
    title: post && post.title ? post.title : '',
    text: post && post.text ? post.text : '',
  });

  const [showForm, toggleShowForm] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className='post-form'>
      <div className='bg-primary p'>
        <h3
          onClick={(e) => toggleShowForm(!showForm)}
          className='cursor-pointer'
        >
          {!updatePostId ? <span>Create Post</span> : <span>Edit Post</span>} <i className='fas fa-chevron-down'></i>
        </h3>
      </div>
      <form
        className='form my-1'
        style={{ display: showForm ? 'block' : 'none' }}
        onSubmit={(e) => {
          e.preventDefault();
          addPost(formData, updatePostId);
          !updatePostId && setFormData({ title: '', text: '' });
          updatePostId && toggleShowForm(false);
        }}
      >
        <input
          onChange={handleChange}
          name='title'
          value={formData.title}
          placeholder='Title optional'
          className='post-form-title'
        />
        <textarea
          name='text'
          cols='30'
          rows='5'
          placeholder='Create a post'
          onChange={handleChange}
          required
          defaultValue={formData.text}
        ></textarea>
        <input type='submit' className='btn btn-dark my-1' value='Submit' />
      </form>
    </div>
  );
};

PostForm.propTypes = {
  addPost: PropTypes.func.isRequired,
  updatePostId: PropTypes.string,
  post: PropTypes.object,
};

export default connect(null, {addPost})(PostForm)
