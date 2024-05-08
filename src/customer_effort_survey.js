import { t }          from './i18n.js';
import { SvgBuilder } from './svg_builder.js';
import {
  STAGING_CDN_URL,
  PRODUCTION_CDN_URL,
  CUSTOMER_EFFORT_SURVEY_COMMENT_LENGTH
} from './constant.js';

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

      $('.js-customer-effort-survery-emoji-reaction svg rect.selected-emoji-background').removeClass('selected-emoji-background')
      $(this).find('svg rect').addClass('selected-emoji-background');
      $('#submit_ces_survery_btn').prop('disabled', false);
      $('#selected_emoji').val($(this).data('emoji'));
    });

    $('body').on('click', 'ces_survery_modal_close_btn', function(e) {
      e.preventDefault();

      $('#customer_effort_survey_modal').modal('hide').remove();
    })

    // Show the modal
    $('#customer_effort_survey_modal').modal('show');
  }

  build() {
    const modal         = $('<div>').addClass('modal fade hide')
                                    .attr('id', 'customer_effort_survey_modal')
                                    .attr('role', 'modal');
    const modalDialog   = $('<div>').addClass('modal-dialog customer-effort-survery-dialog-position customer-effort-survery-dialog-shadow');

    // modal-content
    const modalContent  = $('<div>').addClass('modal-content');

    //modal-header
    const modalHeader = $('<div>').addClass('modal-header').append(
      $('<h5>').addClass('modal-title customer-effort-survery-dialog-title-font-style')
              .text(t('customer-effort-survey-title', 'Feedback')),
      $('<button>').addClass('btn-close')
                   .attr('id', 'modal_close_btn')
                   .attr('type', 'button')
                   .attr('data-bs-dismiss', 'modal')
                   .attr('aria-label', 'Close')
                   .click(this.closeModal)
    );

    //modal-body
    const modalBody       = $('<div>').addClass('modal-body');
    const hiddenField     = $('<input>').attr('id',   'selected_emoji')
                                        .attr('type', 'hidden')
                                        .attr('name', 'selectedEmoji');
    modalBody.append(hiddenField);

    // modal-body description
    const descriptionContainer = $('<div>').addClass('mb-2 mt-0');
    const modalDescription     = $('<span>').addClass('fw-bold customer-effort-survery-dialog-font-style')
                                            .text(t('customer-effort-survey-feedback-question', 'How easy was it to submit the request?'));
    descriptionContainer.append(modalDescription);
    modalBody.append(descriptionContainer);

    // emojis section
    const emojisContainer = $('<div>').addClass('d-flex justify-content-between mt-4 px-4');
    Object.keys(this.emojisMapping).forEach(key => {
      let emoji = key;
      let svg   = this.svgBuilder.build(emoji);
      svg.addClass('js-customer-effort-survery-emoji-reaction')
         .data('emoji', emoji);
      emojisContainer.append(svg);
    });

    // emoji description
    const emojiDescription = $('<div>').addClass('d-flex justify-content-between mt-2 px-2 emoji-description-font-style');
    emojiDescription.append(
      $('<span>').text(t('emoji-description-terrible', 'Terrible')),
      $('<span>').addClass('emoji-description-okay').text(t('emoji-description-okay', 'Ok')),
      $('<span>').text(t('emoji-description-great', 'Great'))
    )

    // comment section
    const commentContainer  = $('<div>').addClass('comment-container mt-3 customer-effort-survery-dialog-font-style');
    const commentLabel      = $('<label>').addClass('col-form-label my-2 fw-bold')
                                          .attr('for', 'comment')
                                          .text(t('optional-comment', 'Write your comment (Optional)'));
    const commentTextarea   = $('<textarea>').addClass('form-control comment-section')
                                             .attr('id', 'comment')
                                             .attr('rows', '4')
                                             .attr('maxlength', CUSTOMER_EFFORT_SURVEY_COMMENT_LENGTH)
                                             .attr('placeholder', t('experience-description', 'Describe your experience here'));
    commentContainer.append(commentLabel, commentTextarea);

    // modal-footer
    const modalFooter = $('<div>').addClass('modal-footer border-top-0');
    const submitBtn   = $('<button>').addClass('btn btn-primary mt-0 mb-3 ces-survery-submit-btn ces-survery-submit-btn-font-style')
                                     .attr('id', 'submit_ces_survery_btn')
                                     .attr('disabled', 'disabled')
                                     .text(t('send-feedback', 'Send Feedback'));

    // Assign submit logic to submit button
    submitBtn.click(this.submitFeedback);
    modalFooter.append(submitBtn);

    // Assemble modal content
    modalBody.append(emojisContainer, emojiDescription, commentContainer);
    modalContent.append(modalHeader, modalBody, modalFooter);
    modalDialog.append(modalContent);
    modal.append(modalDialog);

    return modal;
  }

  // Function to handle form submission
  submitFeedback = () => {
    const self        = this;
    const score       = this.emojisMapping[$('#selected_emoji').val()];
    const comment     = $('#comment').val();
    const headers     = {};
    const queryParams = {
      score:      score || 0,
      comment:    comment,
      ticket_id:  this.requestId,
    };

    debugger;

    $('#submit_ces_survery_btn').prop('disabled', true).text(t('please-wait', 'Please Wait...'));

    this.withToken(token => {
      headers['Authorization'] = 'Bearer ' + token;
      headers['ngrok-skip-browser-warning'] = true;

      $.ajax({
        url:      `https://${this.subdomain}/customer_effort_scores.json`,
        data:     queryParams,
        method:   'POST',
        headers:  headers,
        success:  function(response) {
          self.closeModal();
        },
        error: function(xhr, status, error) {
          console.error('Request error:', error);
        }
      });
    });
  }

  closeModal = () => {
    $('#customer_effort_survey_modal').modal('hide').remove();
  }

  withToken(callback) {
    return $.getJSON('/hc/api/v2/integration/token').then(data => {
      return callback(data.token);
    })
  }
}

export {
  CustomerEffortSurvery
};
