import React, { useState, useEffect } from 'react'
import './styles/index.css'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { 
    carregarLogo, 
    salvarLogo, 
    carregarModelos, 
    salvarModelo as salvarModeloDB, 
    deletarModelo as deletarModeloDB, 
    carregarOrcamentos, 
    salvarOrcamento as salvarOrcamentoDB, 
    deletarOrcamento as deletarOrcamentoDB 
} from './config/database'

function App() {
    // ========== ESTADOS ==========
    const [logo, setLogo] = useState(null)
    const [modelos, setModelos] = useState([])
    const [orcamentos, setOrcamentos] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [orcamentoID, setOrcamentoID] = useState('')
    const [cliente, setCliente] = useState({
        nome: '',
        morada: '',
        contacto: '',
        nif: ''
    })
    const [novoModelo, setNovoModelo] = useState({
        nome: '',
        descricao: '', // ← NOVO CAMPO
        foto: null
    })
    const [janelas, setJanelas] = useState([
        {
            id: Date.now(),
            descricao: '',
            preco: 0,
            precoMontagem: 0,
            desconto: 0,
            quantidade: 1,
            percentualExtra: 0,
            modelo: null
        }
    ])
    const [condicoesFornecimento, setCondicoesFornecimento] = useState(
        `FORMA DE PAGAMENTO
50% ADJUDICAÇÃO
30% ANTES DE ENTRAR EM OBRA
20% APÓS A MONTAGEM

IBAN PT50003300004577424422605

1. VERIFICAÇÃO DE MEDIDAS FINAIS E CONDIÇÕES PARA A VISITA TÉCNICA
Será agendada uma visita técnica para verificação das medidas finais, sendo obrigatória a presença da parte responsável pela obra no local designado. Na hipótese de ausência do responsável, será necessário um novo agendamento, o qual implicará um custo adicional a partir de 120€, previamente informado e confirmado pelo cliente. O atraso superior a 15 (quinze) minutos, sem aviso prévio, será considerado ausência, aplicando-se as condições acima descritas.

Durante a visita técnica, o local deverá estar em condições adequadas para a realização da medição, sendo responsabilidade do cliente garantir a acessibilidade aos vãos onde os trabalhos serão executados.

2. ALTERAÇÕES AO ORÇAMENTO, DESMONTAGEM E EXTRAÇÃO DE MATERIAIS ANTIGOS
Após a visita técnica, além da aferição das medidas, será realizada uma análise da complexidade técnica para a montagem dos produtos. Caso seja necessária a desmontagem e extração de materiais antigos, será aplicado um custo adicional de 20,00€ por unidade, exclusivamente para materiais em madeira ou ferro, devido à complexidade das operações.

O cliente será previamente informado e deverá confirmar a aceitação dos custos adicionais antes da realização dos serviços.

3. CONDIÇÕES DE VALIDADE DA ENCOMENDA
Após a finalização do orçamento, o cliente receberá um resumo detalhado dos termos da encomenda por e-mail. A encomenda será considerada finalizada e vinculativa apenas após a confirmação expressa do cliente, por escrito, através de e-mail ou outro meio de comunicação previamente acordado.

4. EXCLUSÃO DE RESPONSABILIDADE
Não estão incluídos nas propostas:
- Acessórios ou consumíveis necessários à execução da obra;
- Quaisquer elementos não especificados na proposta orçamentária.

5. RESPONSABILIDADE PELAS MEDIDAS E MONTAGEM
A responsabilidade pela precisão das medidas será exclusivamente da Metric Windows PT somente nos casos em que a montagem dos produtos for realizada pela própria empresa.

Após a entrega dos produtos, o cliente deverá verificar e confirmar que os mesmos foram entregues em conformidade com o orçamento e as especificações acordadas. Essa confirmação será considerada como aceitação formal dos produtos entregues.

Caso a montagem seja realizada pelo cliente ou por terceiros contratados pelo cliente, a Metric Windows PT não se responsabiliza por problemas decorrentes de:
- Mau uso dos produtos;
- Erros na execução da montagem;
- Danos causados durante a instalação;
- Uso de silicones de má qualidade.

A garantia fornecida pela Metric Windows PT será limitada exclusivamente aos termos descritos nas Condições de Garantia, cobrindo apenas defeitos de fabrico ou materiais, conforme estipulado no Decreto-Lei n.º 84/2021.

O cliente declara estar ciente de que quaisquer serviços adicionais não previstos no orçamento estarão sujeitos a novo orçamento e aprovação prévia.

6. ASSISTÊNCIA TÉCNICA MONTAGEM E PRODUTO
Pedidos de assistência técnica ao abrigo da garantia serão atendidos no prazo máximo de 30 (trinta) dias úteis, a contar da data do pedido. A garantia cobre exclusivamente defeitos de fabrico ou montagem, conforme previsto no Decreto-Lei n.º 84/2021.

Pedidos fora do âmbito da garantia estarão sujeitos a orçamento prévio, que deverá ser aprovado pelo cliente antes da realização dos serviços.

7. PUBLICIDADE
Ao adjudicar a proposta, o cliente autoriza a empresa a incluir o seu nome, logótipo e imagens da obra no seu site, redes sociais ou materiais promocionais, desde que sejam respeitados a privacidade e os direitos do cliente, sem qualquer contrapartida financeira.

8. ALTERAÇÕES AO ORÇAMENTO APÓS ADJUDICAÇÃO
A Metric Windows PT compromete-se a cumprir os custos e valores definidos na proposta orçamentária após a confirmação do cliente, salvo em situações que justifiquem a revisão do orçamento, conforme previsto neste contrato.

Caso o cliente solicite alterações ao orçamento após a adjudicação, o valor poderá ser ajustado, resultando em aumento ou diminuição do montante inicialmente orçamentado. Todas as alterações deverão ser previamente aprovadas pelo cliente e formalizadas por escrito.`
    )
    const [abaAtiva, setAbaAtiva] = useState('orcamento')
    const [orcamentoAtual, setOrcamentoAtual] = useState(null)

    // ========== CARREGAR DADOS DO FIREBASE ==========
    useEffect(() => {
        const carregarDadosIniciais = async () => {
            try {
                setCarregando(true)
                console.log('🔄 Carregando dados do Firebase...')

                const logoSalvo = await carregarLogo()
                if (logoSalvo) {
                    setLogo(logoSalvo)
                    console.log('✅ Logo carregado!')
                }

                const modelosSalvos = await carregarModelos()
                setModelos(modelosSalvos)
                console.log(`✅ ${modelosSalvos.length} modelos carregados!`)

                const orcamentosSalvos = await carregarOrcamentos()
                setOrcamentos(orcamentosSalvos)
                console.log(`✅ ${orcamentosSalvos.length} orçamentos carregados!`)

                console.log('✅ Todos os dados carregados do Firebase!')
            } catch (error) {
                console.error('❌ Erro ao carregar dados:', error)
                alert('Erro ao carregar dados do Firebase. Verifique a conexão.')
            } finally {
                setCarregando(false)
            }
        }

        carregarDadosIniciais()
    }, [])

    // ========== FUNÇÃO: SALVAR MODELO ==========
    const adicionarModelo = async () => {
        if (!novoModelo.nome.trim()) {
            alert('Por favor, digite o nome do modelo!')
            return
        }

        try {
            console.log('🔄 Salvando modelo...', novoModelo)
            
            const modelo = {
                id: Date.now(),
                nome: novoModelo.nome,
                descricao: novoModelo.descricao || '', // ← SALVAR DESCRIÇÃO
                foto: novoModelo.foto,
                dataCriacao: new Date().toISOString()
            }

            await salvarModeloDB(modelo)
            console.log('✅ Modelo salvo no Firebase!')

            const modelosAtualizados = await carregarModelos()
            setModelos(modelosAtualizados)
            
            setNovoModelo({ nome: '', descricao: '', foto: null }) // ← LIMPAR DESCRIÇÃO
            alert(`✅ Modelo "${modelo.nome}" adicionado com sucesso!`)
        } catch (error) {
            console.error('❌ Erro ao adicionar modelo:', error)
            alert('Erro ao adicionar modelo: ' + error.message)
        }
    }

    // ========== FUNÇÃO: DELETAR MODELO ==========
    const deletarModelo = async (id) => {
        if (!window.confirm('Tem a certeza que deseja apagar este modelo?')) {
            return
        }

        try {
            console.log('🔄 Deletando modelo...', id)
            await deletarModeloDB(id)
            console.log('✅ Modelo deletado!')

            const modelosAtualizados = await carregarModelos()
            setModelos(modelosAtualizados)
            
            alert('✅ Modelo deletado com sucesso!')
        } catch (error) {
            console.error('❌ Erro ao deletar modelo:', error)
            alert('Erro ao deletar modelo: ' + error.message)
        }
    }

    // ========== FUNÇÃO: UPLOAD FOTO MODELO ==========
    const handleFotoModelo = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setNovoModelo({ ...novoModelo, foto: reader.result })
            }
            reader.readAsDataURL(file)
        }
    }

    // ========== FUNÇÃO: SALVAR LOGO ==========
    const handleLogoUpload = async (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = async () => {
                try {
                    console.log('🔄 Salvando logo...')
                    setLogo(reader.result)
                    await salvarLogo(reader.result)
                    console.log('✅ Logo salvo no Firebase!')
                    alert('✅ Logo salvo com sucesso!')
                } catch (error) {
                    console.error('❌ Erro ao salvar logo:', error)
                    alert('Erro ao salvar logo: ' + error.message)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    // ========== FUNÇÕES DE JANELAS ==========
    const adicionarJanela = () => {
        const novaJanela = {
            id: Date.now(),
            descricao: '',
            preco: 0,
            precoMontagem: 0,
            desconto: 0,
            quantidade: 1,
            percentualExtra: 0,
            modelo: null
        }
        setJanelas([...janelas, novaJanela])
    }

    const removerJanela = (id) => {
        if (janelas.length > 1) {
            setJanelas(janelas.filter(j => j.id !== id))
        }
    }

    const atualizarJanela = (id, campo, valor) => {
        setJanelas(janelas.map(j =>
            j.id === id ? { ...j, [campo]: valor } : j
        ))
    }

    // ========== FUNÇÃO: USAR MODELO (ATUALIZADA) ==========
    const usarModelo = (id, janelaId) => {
        const modelo = modelos.find(m => m.id === id)
        if (modelo) {
            // Atualiza o modelo E a descrição da janela
            setJanelas(janelas.map(j => 
                j.id === janelaId 
                    ? { 
                        ...j, 
                        modelo: modelo,
                        descricao: modelo.descricao || j.descricao // ← PREENCHE DESCRIÇÃO
                    } 
                    : j
            ))
        }
    }

    // ========== FUNÇÃO: SALVAR ORÇAMENTO ==========
    const salvarOrcamento = async () => {
        if (!cliente.nome.trim()) {
            alert('Por favor, preencha o nome do cliente!')
            return
        }

        if (!orcamentoID.trim()) {
            alert('Por favor, preencha o ID do Orçamento!')
            return
        }

        try {
            setSalvando(true)
            console.log('🔄 Preparando orçamento para salvar...')

            const janelasLeves = janelas.map(j => ({
                id: j.id,
                descricao: j.descricao,
                preco: parseFloat(j.preco || 0),
                precoMontagem: parseFloat(j.precoMontagem || 0),
                desconto: parseFloat(j.desconto || 0),
                quantidade: parseFloat(j.quantidade || 1),
                percentualExtra: parseFloat(j.percentualExtra || 0),
                modeloId: j.modelo?.id || null,
                modeloNome: j.modelo?.nome || null
            }))

            const novoOrcamento = {
                id: orcamentoID,
                dataCriacao: orcamentoAtual?.dataCriacao || new Date().toLocaleDateString('pt-PT'),
                dataModificacao: new Date().toLocaleDateString('pt-PT'),
                cliente: {
                    nome: cliente.nome,
                    morada: cliente.morada,
                    contacto: cliente.contacto,
                    nif: cliente.nif
                },
                janelas: janelasLeves,
                condicoesFornecimento: condicoesFornecimento.substring(0, 5000),
                temLogo: logo ? true : false
            }

            console.log('🔄 Salvando orçamento no Firebase...', novoOrcamento.id)
            console.log('📊 Tamanho dos dados:', JSON.stringify(novoOrcamento).length, 'caracteres')

            await salvarOrcamentoDB(novoOrcamento)
            console.log('✅ Orçamento salvo no Firebase!')

            console.log('🔄 Recarregando lista de orçamentos do Firebase...')
            const orcamentosAtualizados = await carregarOrcamentos()
            setOrcamentos(orcamentosAtualizados)
            console.log(`✅ ${orcamentosAtualizados.length} orçamentos recarregados do Firebase!`)

            setOrcamentoAtual(novoOrcamento)

            alert(`✅ Orçamento #${novoOrcamento.id} salvo com sucesso!`)

        } catch (error) {
            console.error('❌ Erro ao salvar orçamento:', error)
            console.error('❌ Detalhes do erro:', error.message)
            alert('Erro ao salvar orçamento: ' + error.message)
        } finally {
            setSalvando(false)
        }
    }

    // ========== FUNÇÃO: CARREGAR ORÇAMENTO ==========
    const carregarOrcamento = (orcamento) => {
        setCliente(orcamento.cliente)

        const janelasReconstruidas = orcamento.janelas.map(j => {
            const modeloCompleto = modelos.find(m => m.id === j.modeloId)
            return {
                ...j,
                modelo: modeloCompleto || (j.modeloId ? {
                    id: j.modeloId,
                    nome: j.modeloNome,
                    foto: null
                } : null)
            }
        })

        setJanelas(janelasReconstruidas)
        setCondicoesFornecimento(orcamento.condicoesFornecimento)
        setOrcamentoAtual(orcamento)
        setOrcamentoID(orcamento.id)
        setAbaAtiva('orcamento')
        alert(`✅ Orçamento #${orcamento.id} carregado!`)
    }

    // ========== FUNÇÃO: DELETAR ORÇAMENTO ==========
    const deletarOrcamento = async (id) => {
        if (!window.confirm('Tem a certeza que deseja apagar este orçamento?')) {
            return
        }

        try {
            console.log('🔄 Deletando orçamento...', id)
            await deletarOrcamentoDB(id)
            console.log('✅ Orçamento deletado!')

            const orcamentosAtualizados = await carregarOrcamentos()
            setOrcamentos(orcamentosAtualizados)
            
            alert('✅ Orçamento apagado com sucesso!')
        } catch (error) {
            console.error('❌ Erro ao deletar orçamento:', error)
            alert('Erro ao deletar orçamento: ' + error.message)
        }
    }

    // ========== FUNÇÃO: NOVO ORÇAMENTO ==========
    const novoOrcamento = () => {
        setCliente({ nome: '', morada: '', contacto: '', nif: '' })
        setJanelas([{
            id: Date.now(),
            descricao: '',
            preco: 0,
            precoMontagem: 0,
            desconto: 0,
            quantidade: 1,
            percentualExtra: 0,
            modelo: null
        }])
        setOrcamentoAtual(null)
        setOrcamentoID('')
        setAbaAtiva('orcamento')
    }

    // ========== CÁLCULOS ==========
    const calcularPrecoJanela = (preco, precoMontagem, desconto, percentualExtra = 0, quantidade = 1) => {
        const precoJanela = parseFloat(preco || 0)
        const precoMont = parseFloat(precoMontagem || 0)
        const descontoNumerico = parseFloat(desconto || 0)
        const percentualNumerico = parseFloat(percentualExtra || 0)

        let precoJanelaFinal = precoJanela * (1 - descontoNumerico / 100)
        precoJanelaFinal = precoJanelaFinal * (1 + percentualNumerico / 100)

        let precoMontFinal = precoMont * (1 + percentualNumerico / 100)

        const valorFinal = (precoJanelaFinal + precoMontFinal) * parseFloat(quantidade || 1)

        return valorFinal
    }

    const subtotalJanelas = janelas.reduce((sum, j) => {
        return sum + calcularPrecoJanela(j.preco, j.precoMontagem, j.desconto, j.percentualExtra, j.quantidade)
    }, 0)
    const totalSemIVA = subtotalJanelas

    const calcularIVAs = () => {
        let ivaProduto = 0
        let ivaMontagem = 0

        janelas.forEach(j => {
            const precoJanela = parseFloat(j.preco || 0)
            const precoMont = parseFloat(j.precoMontagem || 0)
            const desc = parseFloat(j.desconto || 0) / 100
            const percExtra = parseFloat(j.percentualExtra || 0) / 100
            const qtd = parseFloat(j.quantidade || 1)

            const precoJanelaFinal = precoJanela * (1 - desc) * (1 + percExtra) * qtd
            const precoMontFinal = precoMont * (1 + percExtra) * qtd

            ivaProduto += precoJanelaFinal * 0.23
            ivaMontagem += precoMontFinal * 0.06
        })

        return { ivaProduto, ivaMontagem }
    }

    const { ivaProduto, ivaMontagem } = calcularIVAs()
    const totalIVA = ivaProduto + ivaMontagem
    const totalComIVA = totalSemIVA + totalIVA

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(valor)
    }

    const getAcabamentoNome = (percentual) => {
        if (percentual === 15) return 'COLORIDA 1 FACE'
        if (percentual === 20) return 'COLORIDA 2 FACES'
        return percentual > 0 ? `+${percentual}%` : '-'
    }

    // ========== GERADOR DE PDF ==========
    const gerarPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4')
        let yPos = 20

        if (logo) {
            try {
                const formato = logo.includes('data:image/png') ? 'PNG' : 'JPEG'
                doc.addImage(logo, formato, 15, yPos, 35, 15)
                yPos += 20
            } catch (error) {
                console.log('Erro ao adicionar logo:', error)
                yPos += 5
            }
        }

        doc.setFillColor(0, 42, 77)
        doc.rect(0, yPos, 210, 20, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont(undefined, 'bold')
        doc.text('METRIC WINDOWS PT', 105, yPos + 7, { align: 'center' })

        doc.setFontSize(11)
        doc.setFont(undefined, 'normal')
        doc.text(`ORÇAMENTO ${orcamentoAtual?.id || orcamentoID || 'NOVO'}`, 105, yPos + 14, { align: 'center' })

        yPos += 25
        doc.setTextColor(0, 0, 0)

        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(0, 42, 77)
        doc.text('DADOS DO CLIENTE', 15, yPos)
        yPos += 6

        doc.setFontSize(9)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(0, 0, 0)

        if (cliente.nome) {
            doc.text(`Nome: ${cliente.nome}`, 15, yPos)
            yPos += 4
        }
        if (cliente.morada) {
            doc.text(`Morada: ${cliente.morada}`, 15, yPos)
            yPos += 4
        }
        if (cliente.contacto) {
            doc.text(`Contacto: ${cliente.contacto}`, 15, yPos)
            yPos += 4
        }
        if (cliente.nif) {
            doc.text(`NIF: ${cliente.nif}`, 15, yPos)
            yPos += 4
        }

        yPos += 5

        if (yPos > 240) {
            doc.addPage()
            yPos = 20
        }

        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(0, 42, 77)
        doc.text('JANELAS', 15, yPos)
        yPos += 4

        const tabelaJanelas = janelas.map((janela, index) => {
            const precoComDesconto = calcularPrecoJanela(janela.preco, janela.precoMontagem, janela.desconto, janela.percentualExtra, janela.quantidade)
            return [
                `#${index + 1}`,
                janela.descricao || 'Sem descrição',
                `${janela.quantidade}x`,
                formatarMoeda(parseFloat(janela.preco || 0) + parseFloat(janela.precoMontagem || 0)),
                janela.desconto > 0 ? `${janela.desconto}%` : '-',
                getAcabamentoNome(janela.percentualExtra),
                formatarMoeda(precoComDesconto)
            ]
        })

        doc.autoTable({
            startY: yPos,
            head: [['Item', 'Descrição', 'Qtd', 'Janela+Montagem', 'Desconto', 'Extra', 'Subtotal']],
            body: tabelaJanelas,
            theme: 'grid',
            headStyles: {
                fillColor: [0, 42, 77],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { left: 15, right: 15 }
        })

        yPos = doc.lastAutoTable.finalY + 8

        const janelasComFoto = janelas.filter(j => j.modelo?.foto)

        if (janelasComFoto.length > 0) {
            if (yPos > 240) {
                doc.addPage()
                yPos = 20
            }

            doc.setFontSize(12)
            doc.setFont(undefined, 'bold')
            doc.setTextColor(0, 42, 77)
            doc.text('MODELOS SELECIONADOS', 15, yPos)
            yPos += 8

            janelasComFoto.forEach((janela) => {
                if (yPos > 235) {
                    doc.addPage()
                    yPos = 20
                }

                try {
                    doc.addImage(janela.modelo.foto, 'PNG', 15, yPos, 35, 35)

                    doc.setTextColor(0, 0, 0)
                    doc.setFontSize(9)
                    doc.setFont(undefined, 'bold')
                    doc.text(`${janela.modelo.nome}`, 55, yPos + 3)

                    doc.setFontSize(7)
                    doc.setFont(undefined, 'normal')

                    const linhasDescricao = doc.splitTextToSize(janela.descricao, 145)
                    doc.text(linhasDescricao, 55, yPos + 9)

                    yPos += 42
                } catch (error) {
                    console.log('Erro ao adicionar foto:', error)
                    yPos += 10
                }
            })

            yPos += 3
        }

        if (yPos > 240) {
            doc.addPage()
            yPos = 20
        }

        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(0, 42, 77)
        doc.text('RESUMO FINANCEIRO', 15, yPos)
        yPos += 5

        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(0, 0, 0)

        const resumoData = [
            ['Total (sem IVA):', formatarMoeda(totalSemIVA)],
            ['', ''],
            ['IVA Produto (23%):', formatarMoeda(ivaProduto)],
            ['IVA Montagem (6%):', formatarMoeda(ivaMontagem)],
        ]

        doc.autoTable({
            startY: yPos,
            body: resumoData,
            theme: 'plain',
            styles: {
                fontSize: 9
            },
            columnStyles: {
                0: { cellWidth: 90 },
                1: { halign: 'right', cellWidth: 80 }
            },
            margin: { left: 15, right: 15 }
        })

        yPos = doc.lastAutoTable.finalY + 5

        doc.setFillColor(0, 42, 77)
        doc.rect(15, yPos, 180, 10, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text('TOTAL COM IVA:', 18, yPos + 6.5)
        doc.text(formatarMoeda(totalComIVA), 190, yPos + 6.5, { align: 'right' })

        yPos += 15

        if (yPos > 250) {
            doc.addPage()
            yPos = 20
        }

        doc.setTextColor(0, 42, 77)
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text('CONDIÇÕES DE FORNECIMENTO', 15, yPos)
        yPos += 5

        doc.setTextColor(0, 0, 0)
        doc.setFontSize(8)
        doc.setFont(undefined, 'normal')

        const condicoesLinhas = doc.splitTextToSize(condicoesFornecimento, 180)
        doc.text(condicoesLinhas, 15, yPos)

        const totalPages = doc.internal.pages.length - 1
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            doc.setFontSize(7)
            doc.setTextColor(150, 150, 150)
            doc.text(
                `Metric Windows PT - Orçamento gerado em ${new Date().toLocaleDateString('pt-PT')}`,
                105,
                285,
                { align: 'center' }
            )
            doc.text(`Página ${i} de ${totalPages}`, 190, 285, { align: 'right' })
        }

        const nomeCliente = cliente.nome || 'Cliente'
        const dataAtual = new Date().toISOString().split('T')[0]
        const nomeArquivo = orcamentoID
            ? `Orcamento_${orcamentoID}_${nomeCliente}_${dataAtual}.pdf`
            : `Orcamento_MetricWindows_${nomeCliente}_${dataAtual}.pdf`

        doc.save(nomeArquivo)
    }

    // ========== TELA DE CARREGAMENTO ==========
    if (carregando) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '24px',
                flexDirection: 'column',
                gap: '20px',
                backgroundColor: '#f0f4f8'
            }}>
                <div style={{ fontSize: '48px' }}>⏳</div>
                <div style={{ fontWeight: 'bold', color: '#002a4d' }}>
                    Carregando dados do Firebase...
                </div>
            </div>
        )
    }

    // ========== RENDER PRINCIPAL ==========
    return (
        <div className="min-h-screen bg-metric-gray-light py-8 px-4">
            <div className="max-w-7xl mx-auto">

                <div className="bg-metric-blue rounded-2xl shadow-2xl p-8 mb-8 text-center relative">
                    {logo && (
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-24 mx-auto mb-4 object-contain"
                        />
                    )}
                    <h1 className="text-4xl font-bold text-white mb-2">
                        METRIC WINDOWS PT
                    </h1>
                    <p className="text-metric-orange text-xl font-semibold">
                        Sistema de Orçamentação Profissional
                    </p>
                    {orcamentoID && (
                        <p className="text-metric-orange text-sm mt-2">
                            ORÇAMENTO <span className="font-bold">{orcamentoID}</span> {orcamentoAtual && `• Criado em ${orcamentoAtual.dataCriacao}`}
                        </p>
                    )}
                </div>

                <div className="flex gap-2 mb-8 flex-wrap">
                    <button
                        onClick={() => setAbaAtiva('orcamento')}
                        className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            abaAtiva === 'orcamento'
                                ? 'bg-metric-blue text-white shadow-lg'
                                : 'bg-white text-metric-blue border-2 border-metric-blue'
                        }`}
                    >
                        📋 Orçamento {orcamentoAtual && `#${orcamentoAtual.id}`}
                    </button>
                    <button
                        onClick={() => setAbaAtiva('modelos')}
                        className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            abaAtiva === 'modelos'
                                ? 'bg-metric-orange text-white shadow-lg'
                                : 'bg-white text-metric-orange border-2 border-metric-orange'
                        }`}
                    >
                        🪟 Modelos ({modelos.length})
                    </button>
                    <button
                        onClick={() => setAbaAtiva('historico')}
                        className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            abaAtiva === 'historico'
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'bg-white text-green-600 border-2 border-green-600'
                        }`}
                    >
                        📁 Histórico ({orcamentos.length})
                    </button>
                </div>

                {abaAtiva === 'historico' && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-metric-blue mb-6 flex items-center gap-2">
                            📁 Histórico de Orçamentos
                        </h2>

                        {orcamentos.length === 0 ? (
                            <p className="text-metric-gray-medium text-center py-8">
                                Nenhum orçamento criado ainda.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-metric-gray-light border-b-2 border-metric-gray-medium">
                                            <th className="px-4 py-3 text-left font-bold text-metric-blue">ID</th>
                                            <th className="px-4 py-3 text-left font-bold text-metric-blue">Cliente</th>
                                            <th className="px-4 py-3 text-left font-bold text-metric-blue">Data Criação</th>
                                            <th className="px-4 py-3 text-left font-bold text-metric-blue">Modificação</th>
                                            <th className="px-4 py-3 text-center font-bold text-metric-blue">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orcamentos.map(orc => (
                                            <tr key={orc.id} className="border-b hover:bg-metric-gray-light transition-colors">
                                                <td className="px-4 py-3 font-bold text-metric-blue">#{orc.id}</td>
                                                <td className="px-4 py-3">{orc.cliente.nome}</td>
                                                <td className="px-4 py-3 text-sm text-metric-gray-medium">{orc.dataCriacao}</td>
                                                <td className="px-4 py-3 text-sm text-metric-gray-medium">{orc.dataModificacao}</td>
                                                <td className="px-4 py-3 text-center space-x-2">
                                                    <button
                                                        onClick={() => carregarOrcamento(orc)}
                                                        className="bg-metric-blue text-white px-3 py-1 rounded text-sm font-bold hover:bg-opacity-90"
                                                    >
                                                        📝 Editar
                                                    </button>
                                                    <button
                                                        onClick={() => deletarOrcamento(orc.id)}
                                                        className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-opacity-90"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {abaAtiva === 'modelos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-metric-orange mb-4 flex items-center gap-2">
                                    ➕ Novo Modelo
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                            Nome do Modelo *
                                        </label>
                                        <input
                                            type="text"
                                            value={novoModelo.nome}
                                            onChange={(e) => setNovoModelo({...novoModelo, nome: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none"
                                            placeholder="Ex: Janela Correr Branca"
                                        />
                                    </div>

                                    {/* ← NOVO CAMPO DE DESCRIÇÃO */}
                                    <div>
                                        <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                            Descrição do Modelo
                                        </label>
                                        <textarea
                                            value={novoModelo.descricao}
                                            onChange={(e) => setNovoModelo({...novoModelo, descricao: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none resize-none"
                                            rows="3"
                                            placeholder="Ex: Janela de Correr - 2000x1500mm - Antracite"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                            Foto do Modelo
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFotoModelo}
                                            className="w-full px-2 py-2 border-2 border-metric-gray-medium rounded-lg cursor-pointer text-sm"
                                        />
                                    </div>

                                    {novoModelo.foto && (
                                        <div>
                                            <img
                                                src={novoModelo.foto}
                                                alt="Preview"
                                                className="w-full h-40 object-cover rounded-lg border-2 border-metric-orange"
                                            />
                                        </div>
                                    )}

                                    <button
                                        onClick={adicionarModelo}
                                        className="w-full bg-metric-orange text-white py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                    >
                                        ✅ Salvar Modelo
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-metric-blue mb-4">
                                    📚 Modelos Salvos
                                </h2>

                                {modelos.length === 0 ? (
                                    <p className="text-metric-gray-medium text-center py-8">
                                        Nenhum modelo criado ainda.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {modelos.map(modelo => (
                                            <div key={modelo.id} className="border-2 border-metric-gray-light rounded-lg p-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-metric-black-soft">
                                                            {modelo.nome}
                                                        </h3>
                                                        {/* ← EXIBIR DESCRIÇÃO */}
                                                        {modelo.descricao && (
                                                            <p className="text-xs text-metric-gray-medium mt-1">
                                                                {modelo.descricao}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => deletarModelo(modelo.id)}
                                                        className="text-red-600 hover:text-red-800 text-lg ml-2"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>

                                                {modelo.foto && (
                                                    <img
                                                        src={modelo.foto}
                                                        alt={modelo.nome}
                                                        className="w-full h-24 object-cover rounded-lg"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {abaAtiva === 'orcamento' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-2 space-y-6">

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-metric-blue mb-4">
                                    🔢 ID do Orçamento
                                </h2>
                                <input
                                    type="text"
                                    value={orcamentoID}
                                    onChange={(e) => setOrcamentoID(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none text-2xl font-bold text-center"
                                    placeholder="Ex: 460"
                                />
                                <p className="text-xs text-metric-gray-medium mt-2 text-center">
                                    Este ID aparecerá no PDF
                                </p>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={salvarOrcamento}
                                    disabled={salvando}
                                    className={`text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${
                                        salvando 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-green-600 hover:bg-opacity-90'
                                    }`}
                                >
                                    {salvando ? '⏳ Salvando...' : '💾 Salvar Orçamento'}
                                </button>
                                <button
                                    onClick={novoOrcamento}
                                    className="bg-metric-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-lg"
                                >
                                    ➕ Novo Orçamento
                                </button>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-metric-blue mb-4 flex items-center gap-2">
                                    🖼️ Logo da Empresa
                                </h2>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg cursor-pointer"
                                />
                                {logo && (
                                    <p className="text-sm text-green-600 mt-2">✅ Logo carregada!</p>
                                )}
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-metric-blue mb-4 flex items-center gap-2">
                                    👤 Dados do Cliente
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            value={cliente.nome}
                                            onChange={(e) => setCliente({...cliente, nome: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none"
                                            placeholder="Ex: Maria Silva"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                            Morada *
                                        </label>
                                        <input
                                            type="text"
                                            value={cliente.morada}
                                            onChange={(e) => setCliente({...cliente, morada: e.target.value})}
                                            className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none"
                                            placeholder="Ex: Rua das Flores, 123"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                                Contacto *
                                            </label>
                                            <input
                                                type="text"
                                                value={cliente.contacto}
                                                onChange={(e) => setCliente({...cliente, contacto: e.target.value})}
                                                className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none"
                                                placeholder="+351 912 345 678"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                                NIF
                                            </label>
                                            <input
                                                type="text"
                                                value={cliente.nif}
                                                onChange={(e) => setCliente({...cliente, nif: e.target.value})}
                                                className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none"
                                                placeholder="123456789"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-metric-blue flex items-center gap-2">
                                        🪟 Janelas ({janelas.length})
                                    </h2>
                                    <button
                                        onClick={adicionarJanela}
                                        className="bg-metric-orange text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90"
                                    >
                                        + Adicionar
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {janelas.map((janela, index) => (
                                        <div key={janela.id} className="border-2 border-metric-gray-light rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="font-bold text-metric-black-soft">
                                                    Janela #{index + 1}
                                                </h3>
                                                {janelas.length > 1 && (
                                                    <button
                                                        onClick={() => removerJanela(janela.id)}
                                                        className="text-red-600 hover:text-red-800 font-semibold"
                                                    >
                                                        🗑️ Remover
                                                    </button>
                                                )}
                                            </div>

                                            {modelos.length > 0 && (
                                                <div className="mb-4">
                                                    <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                                        Usar Modelo (clique para preencher descrição)
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {modelos.map(modelo => (
                                                            <button
                                                                key={modelo.id}
                                                                onClick={() => usarModelo(modelo.id, janela.id)}
                                                                className={`p-2 rounded-lg border-2 transition-all text-xs font-semibold ${
                                                                    janela.modelo?.id === modelo.id
                                                                        ? 'border-metric-orange bg-metric-orange text-white'
                                                                        : 'border-metric-gray-medium hover:border-metric-orange'
                                                                }`}
                                                            >
                                                                {modelo.nome}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                                        Descrição * (editável)
                                                    </label>
                                                    <textarea
                                                        value={janela.descricao}
                                                        onChange={(e) => atualizarJanela(janela.id, 'descricao', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none resize-none"
                                                        rows="2"
                                                        placeholder="Ex: Janela de Correr - 2000x1500mm"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                                            Quantidade
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={janela.quantidade}
                                                            onChange={(e) => atualizarJanela(janela.id, 'quantidade', e.target.value)}
                                                            className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                                            Percentual Extra
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={janela.percentualExtra}
                                                            onChange={(e) => atualizarJanela(janela.id, 'percentualExtra', e.target.value)}
                                                            className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                                        Acabamentos
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => atualizarJanela(janela.id, 'percentualExtra', janela.percentualExtra === 15 ? 0 : 15)}
                                                            className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                                                                janela.percentualExtra === 15
                                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                                    : 'bg-metric-gray-light border-2 border-metric-gray-medium hover:border-blue-600'
                                                            }`}
                                                        >
                                                            🎨 Colorida 1 Face (+15%)
                                                        </button>
                                                        <button
                                                            onClick={() => atualizarJanela(janela.id, 'percentualExtra', janela.percentualExtra === 20 ? 0 : 20)}
                                                            className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                                                                janela.percentualExtra === 20
                                                                    ? 'bg-purple-600 text-white shadow-lg'
                                                                    : 'bg-metric-gray-light border-2 border-metric-gray-medium hover:border-purple-600'
                                                            }`}
                                                        >
                                                            🎨 Colorido 2 Faces (+20%)
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                                            Preço Janela (€) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={janela.preco}
                                                            onChange={(e) => atualizarJanela(janela.id, 'preco', e.target.value)}
                                                            className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                                            Montagem (€) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={janela.precoMontagem}
                                                            onChange={(e) => atualizarJanela(janela.id, 'precoMontagem', e.target.value)}
                                                            className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-metric-black-soft mb-2">
                                                            Desconto (%)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={janela.desconto}
                                                            onChange={(e) => atualizarJanela(janela.id, 'desconto', e.target.value)}
                                                            className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="w-full px-4 py-2 bg-metric-gray-light border-2 border-metric-orange rounded-lg font-bold text-metric-blue text-lg">
                                                        Subtotal: {formatarMoeda(calcularPrecoJanela(janela.preco, janela.precoMontagem, janela.desconto, janela.percentualExtra, janela.quantidade))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-metric-blue mb-4">
                                    📋 Condições de Fornecimento
                                </h2>
                                <textarea
                                    value={condicoesFornecimento}
                                    onChange={(e) => setCondicoesFornecimento(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-metric-gray-medium rounded-lg focus:border-metric-orange focus:outline-none resize-none"
                                    rows="10"
                                />
                            </div>

                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-metric-blue mb-4">
                                    📊 Resumo
                                </h2>

                                <div className="space-y-3 text-sm">
                                    <div className="border-t pt-3"></div>

                                    <div className="flex justify-between">
                                        <span className="text-metric-black-soft font-bold">Total (sem IVA):</span>
                                        <span className="font-bold">{formatarMoeda(totalSemIVA)}</span>
                                    </div>

                                    <div className="border-t pt-3"></div>

                                    <div className="flex justify-between text-xs">
                                        <span className="text-metric-gray-medium">IVA Produto (23%):</span>
                                        <span className="text-metric-gray-medium">{formatarMoeda(ivaProduto)}</span>
                                    </div>

                                    <div className="flex justify-between text-xs">
                                        <span className="text-metric-gray-medium">IVA Montagem (6%):</span>
                                        <span className="text-metric-gray-medium">{formatarMoeda(ivaMontagem)}</span>
                                    </div>

                                    <div className="bg-metric-blue text-white p-4 rounded-lg mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">TOTAL:</span>
                                            <span className="font-bold text-2xl">{formatarMoeda(totalComIVA)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={gerarPDF}
                                    className="w-full mt-6 bg-metric-orange text-white py-3 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg"
                                >
                                    📄 Gerar PDF
                                </button>

                                <button
                                    onClick={salvarOrcamento}
                                    disabled={salvando}
                                    className={`w-full mt-3 text-white py-3 rounded-lg font-bold text-lg transition-all shadow-lg ${
                                        salvando 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-green-600 hover:bg-opacity-90'
                                    }`}
                                >
                                    {salvando ? '⏳ Salvando...' : '💾 Salvar'}
                                </button>

                                <div className="mt-4 text-xs text-metric-gray-medium space-y-1">
                                    <p>✓ Firebase conectado</p>
                                    <p>✓ Dados na nuvem ☁️</p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    )
}

export default App