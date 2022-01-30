function parse(row) {
  const [first, second] = row.split(`,"{`);
  const question = first.replaceAll(`"`, '');
  const [third, fourth] = second.split(`}",`);
  const answers = third.split(',').map((q) => q.replaceAll(`"`, ''));
  const answer = Number(fourth);
  return { question, answers, answer };
}
