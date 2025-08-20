import { GetServerSideProps } from 'next'
import  Head  from "next/head"
import styles from './styles.module.css'

import { db } from '../../services/firebaseConnection'

import {
  doc,
  collection,
  query,
  where,
  getDoc
} from 'firebase/firestore'

export default function Task(){
    return(
        <div className={styles.container}>
          <Head>
             <title>Detalhes da tarefa</title>
          </Head>
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

    console.log(task)

    return{
        props: {

        }
    }

}