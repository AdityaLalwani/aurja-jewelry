export type BlogPost = {
  number: string;
  title: string;
  intro: string;
  paragraphs: string[];
  bullets?: string[];
};

export const blogs: BlogPost[] = [
  {
    number: "01",
    title: "Why do we wear jewellery?",
    intro: "Before jewellery was fashion, it was expression.",
    paragraphs: [
      "Long before trends and seasons, jewellery was a way to tell the world something without saying a word.",
      "Across centuries and cultures, people have worn jewellery to express identity, love, belonging, achievement, celebration and belief. A ring could mark a promise. A pendant could carry meaning. A cherished piece could become a memory passed from one generation to another.",
      "Perhaps that is why jewellery has never truly gone out of style.",
      "We do not simply wear jewellery. We give meaning to what we wear.",
      "At Aurja, we believe that tradition of expression deserves to live in the present, through pieces that feel personal, effortless and distinctly your own.",
    ],
  },
  {
    number: "02",
    title: "Why wear jewellery?",
    intro: "Because some things are meant to be felt, not just seen.",
    paragraphs: [
      "Jewellery has a quiet way of becoming part of us.",
      "It can mark a beginning, celebrate a milestone, hold a memory or simply remind us of who we are becoming.",
      "Sometimes, there does not need to be an occasion.",
      "A piece can be chosen because it feels like you. Because it completes a thought. Because today feels worth remembering.",
      "Jewellery does not always need a reason. Sometimes, the feeling is enough.",
    ],
  },
  {
    number: "03",
    title: "Why should jewellery be for everyone?",
    intro: "Luxury should feel personal, not distant.",
    paragraphs: [
      "For centuries, jewellery has often been associated with grand occasions, something brought out for celebrations and carefully put away afterwards.",
      "We see it differently. Why wait for a milestone to wear something beautiful?",
      "Jewellery can belong to everyday life: to the first coffee of the morning, a day at work, a dinner with friends, a spontaneous journey or a new beginning.",
      "Expression does not belong to a particular age, occasion or style. Jewellery is for every story, and every story deserves something beautiful to remember it by.",
    ],
  },
  {
    number: "04",
    title: "Why should precious jewellery be worn every day?",
    intro: "The beautiful things should not spend their lives in a box.",
    paragraphs: [
      "We often reserve our most precious pieces for the moments we consider important. But perhaps we have been looking at it backwards.",
      "Life itself is made of small moments: ordinary mornings, unexpected evenings, quiet victories and days that become memories only much later.",
      "Why should something precious be saved only for the biggest ones? At Aurja, we believe jewellery should live with you.",
      "Worn. Loved. Remembered.",
      "A piece becomes truly precious not simply because of what it is made from, but because of what it comes to mean.",
    ],
  },
  {
    number: "05",
    title: "Gold & Silver",
    intro: "Two metals. Endless stories.",
    paragraphs: [
      "Gold and silver have been part of jewellery for thousands of years, yet each continues to feel remarkably contemporary.",
      "Gold carries warmth, richness and a sense of permanence. Silver brings a cooler, quieter and more effortless character.",
      "Neither is better. They simply tell different stories.",
      "Choosing between them does not have to be about rules. It can be about mood, personality, styling and the moment you are dressing for.",
      "At Aurja, we believe jewellery should be chosen instinctively: sometimes gold, sometimes silver, sometimes both. There are no rules to personal style.",
    ],
  },
  {
    number: "06",
    title: "Jewellery Care",
    intro: "Wear it often. Care for it thoughtfully.",
    paragraphs: [
      "The beauty of jewellery lies in its relationship with time. Every piece deserves a little care, not to keep it untouched, but to help it remain part of your story for longer.",
      "And most importantly, wear it. Jewellery was never meant to be kept perfectly untouched. It was meant to become part of life.",
    ],
    bullets: [
      "Keep it away from harsh chemicals. Perfumes, lotions, chlorine and household chemicals can affect certain metals and finishes.",
      "Give it a little space. Store pieces separately to minimise scratches, tangling and unnecessary friction.",
      "Keep it dry when appropriate. Moisture and prolonged exposure to water can affect some jewellery finishes.",
      "Clean it gently. A soft, clean cloth can help remove everyday oils and residue. Avoid harsh abrasives unless specifically recommended for the piece.",
    ],
  },
  {
    number: "07",
    title: "Get Aurja Journal Updates",
    intro: "There is more to jewellery than what meets the eye.",
    paragraphs: [
      "Discover the stories behind what we wear, the world of jewellery, the details that make a piece special and the ideas shaping Aurja.",
      "New stories. New pieces. First glimpses.",
      "Join the Aurja Journal.",
    ],
  },
];
