import { ilha } from "ilha";
import { Textarea } from "areia";

export const Demo1 = ilha.render(() => (
  <Textarea
    label="Bio"
    description="Tell us a little about yourself. Max 500 characters."
    placeholder="I design and build design systems..."
    rows={4}
  />
));

export const Demo2 = ilha.render(() => (
  <Textarea
    id="notes"
    label="Notes"
    description="Add any additional context for the reviewer."
    placeholder="Write your notes here..."
    rows={3}
  />
));

export const Demo3 = ilha.render(() => (
  <Textarea aria-label="Message" placeholder="Type your message..." rows={4} />
));

export const Demo4 = ilha.render(() => (
  <Textarea
    id="bio"
    label="Bio"
    description="A short description that appears on your public profile."
    placeholder="I design and build design systems..."
    rows={4}
  />
));

export const Demo5 = ilha.render(() => (
  <Textarea
    id="message-error"
    label="Message"
    placeholder="Type your message..."
    value="This message is way too long for the field limit..."
    error="Message must be less than 500 characters."
  />
));

export const Demo6 = ilha.render(() => (
  <Textarea
    id="comment"
    label="Comment"
    required
    placeholder="Share your thoughts..."
    error={{
      message: "Comment is required.",
      match: "valueMissing",
    }}
  />
));

export const Demo7 = ilha.render(() => (
  <div class="flex w-full max-w-sm flex-col gap-3">
    <Textarea size="xs" aria-label="Extra small textarea" placeholder="Extra small" rows={2} />
    <Textarea size="sm" aria-label="Small textarea" placeholder="Small" rows={2} />
    <Textarea size="base" aria-label="Base textarea" placeholder="Base" rows={2} />
    <Textarea size="lg" aria-label="Large textarea" placeholder="Large" rows={2} />
  </div>
));

export const Demo8 = ilha.render(() => (
  <div class="flex w-full max-w-sm flex-col gap-3">
    <Textarea label="Short response" placeholder="A couple of lines..." rows={2} />
    <Textarea label="Detailed response" placeholder="Take your time to explain..." rows={5} />
  </div>
));

export const Demo9 = ilha.render(() => (
  <Textarea label="Notes" placeholder="Write your notes here..." disabled />
));

export const Demo10 = ilha.render(() => (
  <Textarea
    id="comments"
    label="Additional comments"
    required={false}
    placeholder="Anything else we should know..."
    rows={3}
  />
));

export const Demo11 = ilha.render(() => (
  <Textarea
    id="release-notes"
    label="Release notes"
    labelTooltip="These notes are published with the release and visible to all users."
    placeholder="What changed in this version?"
    rows={4}
  />
));

export const Demo12 = ilha.render(() => (
  <Textarea
    id="review-notes"
    label={
      <>
        Notes for <strong>review</strong>
      </>
    }
    required
    placeholder="Add notes for the reviewer..."
    rows={3}
  />
));

export const Demo13 = ilha.render(() => (
  <Textarea
    id="feedback-error"
    aria-label="Feedback"
    placeholder="Share your feedback..."
    description="Your feedback helps us improve the product."
    error="Feedback is currently unavailable."
  />
));

export const Demo14 = ilha.render(() => (
  <div class="flex w-full max-w-sm flex-col gap-3">
    <Textarea label="Vertical resize" placeholder="Resize vertically only..." rows={3} />
    <Textarea
      label="Horizontal resize"
      placeholder="Resize horizontally only..."
      class="resize-horizontal"
      rows={3}
    />
    <Textarea label="No resize" placeholder="Cannot be resized..." class="resize-none" rows={3} />
  </div>
));
