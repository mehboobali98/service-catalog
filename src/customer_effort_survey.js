import { STAGING_CDN_URL, PRODUCTION_CDN_URL } from './constant.js';

class CustomerEffortSurvery {
  constructor(locale) {
    this.localte        = locale;
    // order is important
    this.emojisMapping  = {
      'anger': 1,
      'disappointed': 2,
      'satisfied': 3,
      'happy': 4,
      'loving': 5
    }
  }

  render() {
    const cesModal = this.build();
    $('body').append(cesModal);
    // Show the modal
    $('#customer_effort_survey_modal').modal('show');
  }

  build() {
    const modal         = $('<div>').addClass('modal fade').attr('id', 'customer_effort_survey_modal').attr('role', 'dialog');
    const modalDialog   = $('<div>').addClass('modal-dialog');

    // modal-content
    const modalContent  = $('<div>').addClass('modal-content');

    //modal-header
    const modalHeader = $('<div>').addClass('modal-header').append(
      $('<h5>').addClass('modal-title').text('Feedback'),
      $('<button>').addClass('btn-close').attr('type', 'button').attr('data-bs-dismiss', 'modal').attr('aria-label', 'Close')
    );

    //modal-body
    const modalBody       = $('<div>').addClass('modal-body');
    const emojisContainer = $('<div>').addClass('d-flex justify-content-between');

    Object.keys(this.emojisMapping).forEach(function(key) {
      let emoji = key;
      let img = $('<img>').addClass('emoji').attr('src', `${PRODUCTION_CDN_URL}/service_catalog/shared/dist/public/images/svg/${emoji}.svg`);
    });

    const commentLabel    = $('<label>').addClass('col-form-label').attr('for', 'comment').text('Comments:');
    const commentTextarea = $('<textarea>').addClass('form-control').attr('id', 'comment').attr('rows', '4');

    // modal-footer
    const modalFooter = $('<div>').addClass('modal-footer');
    const submitBtn = $('<button>').addClass('btn btn-primary').attr('id', 'submit').text('Send Feedback');

    // Assign submit logic to submit button
    submitBtn.click(this.submitFeedback);
    modalFooter.append(submitBtn);

    // Assemble modal content
    modalBody.append(emojisContainer, commentLabel, commentTextarea);
    modalContent.append(modalHeader, modalBody, modalFooter);
    modalDialog.append(modalContent);
    modal.append(modalDialog);
    return modal;
  }

  // Function to handle form submission
  submitFeedback() {
    const comment = $('#comment').val(); // Get comment from textarea
    const emojis = $('.emojis-container .emoji').toArray().map(function(el) {
      return $(el).attr('src');
    }); // Get emoji SVG URLs from emojis container

    // AJAX request
    $.ajax({
      url: 'your_api_endpoint',
      method: 'POST',
      data: {
        comment: comment,
        emojis: emojis
      },
      success: function(response) {
        console.log('AJAX request successful', response);
        // Handle success response
      },
      error: function(xhr, status, error) {
        console.error('AJAX request error:', error);
        // Handle error
      }
    });
  }
}

export {
  CustomerEffortSurvery
};