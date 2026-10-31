'use strict';

// Incremento del Trayecto 3 - HU6.
// Amplía la recomendación sin modificar las reglas de perfilamiento, la valoración
// ni la evidencia histórica de la versión anterior.
const hu6Text = {
  es: {
    about: 'Conoce tu destino',
    features: 'Características principales',
    match: '¿Por qué coincide contigo?',
    setting: 'Entorno recomendado',
    climate: 'Clima asociado',
    experience: 'Experiencia principal',
    exact(profile) {
      return `Se seleccionó porque indicaste un destino ${t(profile.type).toLowerCase()}, clima ${t(profile.climate).toLowerCase()} y una experiencia de ${t(profile.experience).toLowerCase()}.`;
    },
    fallback(profile, destination) {
      return `La selección conserva tu preferencia de destino ${t(profile.type).toLowerCase()} y clima ${t(profile.climate).toLowerCase()}. Para esta combinación no existe una coincidencia exacta de experiencia en el catálogo reducido, por lo que se propone ${destination[0]} como alternativa disponible.`;
    },
    description(destination) {
      return `${destination[0]} ofrece ${destination[4]}. Esta versión ampliada presenta el contexto esencial del destino y lo relaciona con las preferencias seleccionadas para facilitar la evaluación de la alternativa.`;
    }
  },
  en: {
    about: 'Discover your destination',
    features: 'Key characteristics',
    match: 'Why does it match you?',
    setting: 'Recommended setting',
    climate: 'Associated climate',
    experience: 'Main experience',
    exact(profile) {
      return `It was selected because you chose a ${t(profile.type).toLowerCase()} destination, ${t(profile.climate).toLowerCase()} climate and a ${t(profile.experience).toLowerCase()} experience.`;
    },
    fallback(profile, destination) {
      return `The selection preserves your ${t(profile.type).toLowerCase()} destination and ${t(profile.climate).toLowerCase()} climate preferences. This reduced catalog has no exact experience match for the combination, so ${destination[0]} is presented as the available alternative.`;
    },
    description(destination) {
      return `${destination[0]} offers ${destination[5]}. This expanded version presents the destination's essential context and relates it to the selected preferences to make the alternative easier to evaluate.`;
    }
  }
};

function hu6Copy() {
  return hu6Text[lang] || hu6Text.es;
}

// Reemplaza únicamente la presentación del resultado. Las reglas de recomendación
// siguen siendo las mismas de la V1 para que el incremento sea trazable.
renderRecommendation = function renderRecommendationHU6() {
  if (!current) return;

  const { profile: p, destination: d } = current;
  const copy = hu6Copy();
  const target = $('recommendation');
  target.replaceChildren();

  target.append(
    element('span', t('your'), 'eyebrow'),
    element('h3', d[0], 'destination'),
    element('span', `${t(p.type)} · ${t(p.climate)} · ${t(p.experience)} · ${p.travelers} ${t('people')}`, 'tag'),
    element('h4', copy.about),
    element('p', copy.description(d)),
    element('h4', copy.features)
  );

  const features = document.createElement('ul');
  features.append(
    element('li', `${copy.setting}: ${lang === 'es' ? d[4] : d[5]}.`),
    element('li', `${copy.climate}: ${t(p.climate)}.`),
    element('li', `${copy.experience}: ${t(d[3])}.`)
  );
  target.append(features);

  target.append(
    element('h4', copy.match),
    element('p', d[3] === p.experience ? copy.exact(p) : copy.fallback(p, d)),
    element('p', t('context'), 'micro'),
    element('p', t('notice'), 'note')
  );
};
