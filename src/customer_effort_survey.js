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
    $('body').on('click', '.js-customer-effort-survery-emoji-reaction', function(event) {
      debugger;
      $(this).find('svg rect').addClass('emoji-on-select');
    })

    // Show the modal
    $('#customer_effort_survey_modal').modal('show');
  }

  build() {
    const modal         = $('<div>').addClass('modal').attr('id', 'customer_effort_survey_modal').attr('role', 'dialog');
    const modalDialog   = $('<div>').addClass('modal-dialog customer-effort-survery-dialog-position');

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
      // <object data="happy.svg" width="300" height="300"> </object>
      let obj = $('<obj>').addClass('js-customer-effort-survery-emoji-reaction')
                          .attr({
                            'data': `https://mehboobali98.github.io/service-catalog/dist/public/${emoji}.svg`,
                            'type': 'image/svg+xml'
                          });
      // let img = $('<img>').addClass('js-customer-effort-survery-emoji-reaction')
      //                     .attr('src', `https://mehboobali98.github.io/service-catalog/dist/public/${emoji}.svg`);
      emojisContainer.append(obj);
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