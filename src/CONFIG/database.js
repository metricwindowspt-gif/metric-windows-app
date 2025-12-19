import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore'

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDpXGg7W8p_5-lcEYqH0aKNZ_LJLmxgXzM",
    authDomain: "metric-windows-app.firebaseapp.com",
    projectId: "metric-windows-app",
    storageBucket: "metric-windows-app.firebasestorage.app",
    messagingSenderId: "125125597430",
    appId: "1:125125597430:web:3b4a5e8f8e8f8e8f8e8f8e"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ========== LOGO ==========
export const carregarLogo = async () => {
    try {
        const logoDoc = await getDocs(collection(db, 'configuracoes'))
        const logoData = logoDoc.docs.find(doc => doc.id === 'logo')
        return logoData ? logoData.data().url : null
    } catch (error) {
        console.error('Erro ao carregar logo:', error)
        return null
    }
}

export const salvarLogo = async (logoBase64) => {
    try {
        await setDoc(doc(db, 'configuracoes', 'logo'), {
            url: logoBase64,
            dataAtualizacao: new Date().toISOString()
        })
        console.log('✅ Logo salvo no Firebase!')
        return true
    } catch (error) {
        console.error('❌ Erro ao salvar logo:', error)
        throw error
    }
}

// ========== MODELOS ==========
export const carregarModelos = async () => {
    try {
        const modelosSnapshot = await getDocs(collection(db, 'modelos'))
        const modelos = modelosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        console.log(`✅ ${modelos.length} modelos carregados do Firebase`)
        return modelos
    } catch (error) {
        console.error('❌ Erro ao carregar modelos:', error)
        return []
    }
}

export const salvarModelo = async (modelo) => {
    try {
        await setDoc(doc(db, 'modelos', modelo.id.toString()), {
            nome: modelo.nome,
            foto: modelo.foto,
            dataCriacao: new Date().toISOString()
        })
        console.log('✅ Modelo salvo no Firebase!')
        return true
    } catch (error) {
        console.error('❌ Erro ao salvar modelo:', error)
        throw error
    }
}

export const deletarModelo = async (id) => {
    try {
        await deleteDoc(doc(db, 'modelos', id.toString()))
        console.log('✅ Modelo deletado do Firebase!')
        return true
    } catch (error) {
        console.error('❌ Erro ao deletar modelo:', error)
        throw error
    }
}

// ========== ORÇAMENTOS ==========
export const carregarOrcamentos = async () => {
    try {
        const orcamentosSnapshot = await getDocs(collection(db, 'orcamentos'))
        const orcamentos = orcamentosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        console.log(`✅ ${orcamentos.length} orçamentos carregados do Firebase`)
        return orcamentos
    } catch (error) {
        console.error('❌ Erro ao carregar orçamentos:', error)
        return []
    }
}

export const salvarOrcamento = async (orcamento) => {
    try {
        await setDoc(doc(db, 'orcamentos', orcamento.id.toString()), {
            dataCriacao: orcamento.dataCriacao,
            dataModificacao: orcamento.dataModificacao,
            cliente: orcamento.cliente,
            janelas: orcamento.janelas,
            condicoesFornecimento: orcamento.condicoesFornecimento,
            logo: orcamento.logo
        })
        console.log('✅ Orçamento salvo no Firebase!')
        return true
    } catch (error) {
        console.error('❌ Erro ao salvar orçamento:', error)
        throw error
    }
}

export const deletarOrcamento = async (id) => {
    try {
        await deleteDoc(doc(db, 'orcamentos', id.toString()))
        console.log('✅ Orçamento deletado do Firebase!')
        return true
    } catch (error) {
        console.error('❌ Erro ao deletar orçamento:', error)
        throw error
    }
}