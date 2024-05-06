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

      $(this).find('svg rect').addClass('selected-emoji-background');
      debugger;
    });

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
    const hiddenField     = $('<input>').attr('id',   'selected_emoji')
                                        .attr('type', 'hidden')
                                        .attr('name', 'selectedEmoji');
    modalBody.append(hiddenField);

    const emojisContainer = $('<div>').addClass('d-flex justify-content-between');

    Object.keys(this.emojisMapping).forEach(key => {
      let emoji = key;
      debugger;
      let svg = this.svgBuilder.build(emoji);
      svg.addClass('js-customer-effort-survery-emoji-reaction');
      debugger;
      // let img = $('<img>').addClass('js-customer-effort-survery-emoji-reaction')
      //                     .attr('src', `https://mehboobali98.github.io/service-catalog/dist/public/${emoji}.svg`)
      //                     .attr('id', emoji);
      svg.click(function() {
        $('#selected_emoji').val(emoji);
      });
      emojisContainer.append(svg);
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
    const comment = $('#comment').val();
    const emojis = $('.emojis-container .emoji').toArray().map(function(el) {
      return $(el).attr('src');
    }); // Get emoji SVG URLs from emojis container

    const queryParams = {
      score:      score,
      comment:    comment,
      ticket_id:  this.requestId,
    };

    // AJAX request
    $.ajax({
      url:     `https://${this.ezoSubdomain}/customer_effort_scores`,
      data:     queryParams,
      method:  'POST',
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
  }
}

export {
  CustomerEffortSurvery
};