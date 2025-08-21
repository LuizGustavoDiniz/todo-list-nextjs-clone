import { ChangeEvent, FormEvent, useState } from 'react'
import { useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import  Head  from "next/head"
import styles from './styles.module.css'

import { db } from '../../services/firebaseConnection'

import {
  doc,
  collection,
  query,
  where,
  getDoc,
  addDoc
} from 'firebase/firestore'

import { Textarea } from '../../components/textarea'

interface TaskProps {

  item:{
    task: string
    public: boolean
    created: string
    user: string
    taskId: string
  }
}

/*
então na funçao getServerSideProps onde fazemos codigos no servidor
sempre devemos retornar algum dado o final dela é com

return{
        props: {
           algo: item
        }
    }

então o final dela é sempre devolver algo, assim como um servidor mesmo, servir
então sempre faremos algo dentro dela e devolveremos o resultado

e o que devolvermos conseguimos pegar como prop no componente principal por exemplo

const App = ({ item vindo do getServerSideProps}) => {

}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  
let item = {
  ola: 'mundo'
}

return{
        props: {
           item: item
        }
    }

}
*/

export default function Task({ item }: TaskProps){

  const { data: session } = useSession()

  const [input, setInput] = useState('')

  const handleComment = async (event: FormEvent) => {
    event.preventDefault()

    if(input === '')return;

    if(!session?.user?.email || !session?.user?.name)return

    try {
      
      const docRef = await addDoc(collection(db, 'comments'), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        session: session?.user?.name,
        taskId: item?.taskId
      })

      setInput('')

    } catch (error) {
      
    }

  }

    return(
        <div className={styles.container}>
          <Head>
             <title>Detalhes da tarefa</title>
          </Head>

           <main className={styles.main}>
             <h1>Tarefa</h1>

             <article className={styles.task}>
              <p>{item.task}</p>
             </article>
           </main>

           <section className={styles.commentsContainer}>
            <h2>Deixar comentário</h2>

            <form onSubmit={handleComment}>
              <Textarea
               placeholder='Digite seu comentário'
               value={input}
               onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
              />

              <button 
              type='submit' 
              className={styles.btn} 
              disabled={!session?.user ? true : false}>
                Enviar comentário</button>
            </form>
           </section>
        </div>
    )
}

/*
esse código 

export const getServerSideProps: GetServerSideProps = async ({}) => {

    return{
        props: {

        }
    }

}

serve pra rodar algo do lado do servidor, se por exemplo colocarmos um console.log()
nele nós veremos o resultado
no terminal ou seja essa é a forma de rodarmos/pegarmos algo no lado do servidor
usando o next
*/

export const getServerSideProps: GetServerSideProps = async ({ params }) => {

    const id = params?.id as string;

    const docRef = doc(db, 'tasks', id)

    const snapshot = await getDoc(docRef)

    if(snapshot.data() === undefined){
        return{
          redirect:{
            destination: '/',
            permanent: false
          }
        }
    }

    if(!snapshot.data()?.public){
       return{
          redirect:{
            destination: '/',
            permanent: false
          }
        }
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000;

    const task = {
        task: snapshot.data()?.task,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id
    }

    return{
        props: {
           item: task
        }
    }

}