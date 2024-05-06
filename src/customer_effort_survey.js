import { SvgBuilder }                          from './svg_builder.js';
import { STAGING_CDN_URL, PRODUCTION_CDN_URL } from './constant.js';

class CustomerEffortSurvery {
  constructor(locale, requestId, subdomain) {
    this.locale         = locale;
    this.subdomain      = subdomain;
    this.requestId      = requestId;
    this.svgBuilder     = new SvgBuilder();

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

    $('body').on('click', '.js-customer-effort-survery-emoji-reaction', function(e) {
      e.preventDefault();

      debugger;
      $('.js-customer-effort-survery-emoji-reaction svg rect.selected-emoji-background').removeClass('selected-emoji-background')
      $(this).find('svg rect').addClass('selected-emoji-background');
      $('#submit_ces_survery_btn').prop('disabled', false);
    });

    $('body').on('click', 'ces_survery_modal_close_btn', function(e) {
      e.preventDefault();

      $('#customer_effort_survey_modal').modal('hide');
    })

    // Show the modal
    $('#customer_effort_survey_modal').modal('show');
  }

  build() {
    const modal         = $('<div>').addClass('modal fade')
                                    .attr('id', 'customer_effort_survey_modal')
                                    .attr('role', 'modal');
    const modalDialog   = $('<div>').addClass('modal-dialog customer-effort-survery-dialog-position');

    // modal-content
    const modalContent  = $('<div>').addClass('modal-content');

    //modal-header
    const modalHeader = $('<div>').addClass('modal-header').append(
      $('<h5>').addClass('modal-title').text('Feedback'),
      $('<button>').addClass('btn-close').attr('id', 'modal_close_btn').attr('type', 'button').attr('data-bs-dismiss', 'modal').attr('aria-label', 'Close')
                   .click(this.closeModal)
    );

    //modal-body
    const modalBody       = $('<div>').addClass('modal-body');
    const hiddenField     = $('<input>').attr('id',   'selected_emoji')
                                        .attr('type', 'hidden')
                                        .attr('name', 'selectedEmoji');
    modalBody.append(hiddenField);

    // modal-body description
    const descriptionContainer = $('<div>').addClass('my-2');
    const modalDescription     = $('<span>').addClass('fw-bold')
                                            .text('How easy was it to submit the request?');
    descriptionContainer.append(modalDescription);
    modalBody.append(descriptionContainer);

    // emojis section
    const emojisContainer = $('<div>').addClass('d-flex justify-content-between');
    Object.keys(this.emojisMapping).forEach(key => {
      let emoji = key;
      let svg   = this.svgBuilder.build(emoji);
      svg.addClass('js-customer-effort-survery-emoji-reaction');
      svg.click(function() {
        $('#selected_emoji').val(emoji);
      });
      emojisContainer.append(svg);
    });


    // comment section
    const commentContainer  = $('<div>').addClass('comment-container');
    const commentLabel      = $('<label>').addClass('col-form-label')
                                          .attr('for', 'comment')
                                          .text('Write your comment (Optional)');
    const commentTextarea   = $('<textarea>').addClass('form-control')
                                             .attr('id', 'comment')
                                             .attr('rows', '4');
    commentContainer.append(commentLabel, commentTextarea);

    // modal-footer
    const modalFooter = $('<div>').addClass('modal-footer');
    const submitBtn   = $('<button>').addClass('btn btn-primary')
                                     .attr('id', 'submit_ces_survery_btn')
                                     .attr('disabled', 'disabled')
                                     .attr('placeholder', 'Describe your experience here')
                                     .text('Send Feedback');

    // Assign submit logic to submit button
    submitBtn.click(this.submitFeedback);
    modalFooter.append(submitBtn);

    // Assemble modal content
    modalBody.append(emojisContainer, commentContainer);
    modalContent.append(modalHeader, modalBody, modalFooter);
    modalDialog.append(modalContent);
    modal.append(modalDialog);

    return modal;
  }

  // Function to handle form submission
  submitFeedback = () => {
    const score       = this.emojisMapping[$('#selected_emoji').val()];
    const comment     = $('#comment').val();
    const headers     = {};
    const queryParams = {
      score:      score || 0,
      comment:    comment,
      ticket_id:  this.requestId,
    };

    this.withToken(token => {
      debugger;
      headers['Authorization'] = 'Bearer ' + token;
      headers['ngrok-skip-browser-warning'] = true;
      debugger;

      $.ajax({
        url:      `https://${this.subdomain}/customer_effort_scores.json`,
        data:     queryParams,
        method:   'POST',
        headers:  headers,
        success: function(response) {
          debugger;
          console.log('AJAX request successful', response);
          // Handle success response
        },
        error: function(xhr, status, error) {
          debugger;
          console.error('AJAX request error:', error);
          // Handle error
        }
      });
    });
  }

  withToken(callback) {
    return $.getJSON('/hc/api/v2/integration/token').then(data => {
      return callback(data.token);
    })
  }

  closeModal = () => {
    $('#customer_effort_survey_modal').modal('hide');
  }
}

export {
  CustomerEffortSurvery
};
