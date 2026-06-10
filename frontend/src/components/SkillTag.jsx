const SkillTag = ({ label, variant = 'mandatory' }) => {
  const cls = {
    mandatory: 'tag tag--mandatory',
    optional: 'tag tag--optional',
    neutral: 'tag tag--neutral',
  }[variant] || 'tag tag--neutral';

  return <span className={cls}>{label}</span>;
};

export default SkillTag;
