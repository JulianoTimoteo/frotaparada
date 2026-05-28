import db from './initFirebase';

async function carregarDadosOficina() {
  try {
    const querySnapshot = await db.collectionGroup('ordens').get();
    const dados = querySnapshot.docs.map(doc => doc.data());
    console.log('Dados carregados:', dados);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

export default carregarDadosOficina;